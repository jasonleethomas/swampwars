/* */ 
System.register(['typescript', './logger', "./utils", "./compiler-host"], function(exports_1) {
    var ts, logger_1, utils_1, compiler_host_1;
    var logger, TypeChecker, Deferred;
    return {
        setters:[
            function (ts_1) {
                ts = ts_1;
            },
            function (logger_1_1) {
                logger_1 = logger_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (compiler_host_1_1) {
                compiler_host_1 = compiler_host_1_1;
            }],
        execute: function() {
            logger = new logger_1.default({ debug: false });
            TypeChecker = (function () {
                function TypeChecker(host, resolve, fetch) {
                    this._host = host;
                    this._resolve = resolve;
                    this._fetch = fetch;
                    this._options = ts.clone(this._host.options);
                    this._options.inlineSourceMap = false;
                    this._options.sourceMap = false;
                    this._options.declaration = false;
                    this._options.isolatedModules = false;
                    this._options.skipDefaultLibCheck = true;
                    this._files = {};
                    this._declarationFiles = [];
                    this._typings = {};
                }
                TypeChecker.prototype.check = function (sourceName, source) {
                    var file = this.registerFile(sourceName);
                    this.registerSource(sourceName, source);
                    return file.errors;
                };
                TypeChecker.prototype.registerDeclarationFile = function (sourceName, isDefaultLib) {
                    var file = this.registerFile(sourceName, isDefaultLib);
                    this._declarationFiles.push(file);
                };
                TypeChecker.prototype.registerFile = function (sourceName, isDefaultLib) {
                    var _this = this;
                    if (isDefaultLib === void 0) { isDefaultLib = false; }
                    if (!this._files[sourceName]) {
                        var source = new Deferred();
                        if (utils_1.isTypescriptDeclaration(sourceName)) {
                            this._fetch(sourceName)
                                .then(function (source) {
                                _this._host.addFile(sourceName, source, isDefaultLib);
                                _this.registerSource(sourceName, source);
                            })
                                .catch(function (err) {
                                logger.error(err.message);
                            });
                        }
                        var loaded = source.promise
                            .then(function (source) { return _this.resolveDependencies(sourceName, source); })
                            .then(function (depsMap) {
                            _this._host.addResolutionMap(sourceName, depsMap);
                            _this._files[sourceName].deps = Object.keys(depsMap)
                                .map(function (key) { return depsMap[key]; })
                                .filter(function (res) { return utils_1.isTypescript(res); })
                                .map(function (res) { return _this.registerFile(res); })
                                .concat(_this._declarationFiles);
                        });
                        var errors = loaded
                            .then(function () { return _this.canEmit(_this._files[sourceName]); })
                            .then(function () { return _this.getAllDiagnostics(_this._files[sourceName]); });
                        this._files[sourceName] = {
                            sourceName: sourceName,
                            source: source,
                            loaded: loaded,
                            errors: errors,
                            checked: false,
                        };
                    }
                    return this._files[sourceName];
                };
                TypeChecker.prototype.registerSource = function (sourceName, source) {
                    if (!this._files[sourceName])
                        throw new Error(sourceName + " has not been registered");
                    this._files[sourceName].source.resolve(source);
                };
                TypeChecker.prototype.resolveDependencies = function (sourceName, source) {
                    var _this = this;
                    var info = ts.preProcessFile(source, true);
                    var resolvedReferences = info.referencedFiles
                        .map(function (ref) { return _this.resolveReference(ref.fileName, sourceName); });
                    var resolvedImports = info.importedFiles
                        .map(function (imp) { return _this.resolveImport(imp.fileName, sourceName); });
                    var refs = [].concat(info.referencedFiles).concat(info.importedFiles).map(function (pre) { return pre.fileName; });
                    var deps = resolvedReferences.concat(resolvedImports);
                    return Promise.all(deps)
                        .then(function (resolved) {
                        return refs.reduce(function (result, ref, idx) {
                            result[ref] = resolved[idx];
                            return result;
                        }, {});
                    });
                };
                TypeChecker.prototype.resolveReference = function (referenceName, sourceName) {
                    if ((utils_1.isAmbient(referenceName) && !this._options.resolveAmbientRefs) || (referenceName.indexOf("/") === -1))
                        referenceName = "./" + referenceName;
                    return this._resolve(referenceName, sourceName);
                };
                TypeChecker.prototype.resolveImport = function (importName, sourceName) {
                    var _this = this;
                    if (utils_1.isRelative(importName) && utils_1.isTypescriptDeclaration(sourceName) && !utils_1.isTypescriptDeclaration(importName))
                        importName = importName + ".d.ts";
                    return this._resolve(importName, sourceName)
                        .then(function (resolvedImport) {
                        if (_this._options.resolveTypings && utils_1.isAmbientImport(importName) && utils_1.isJavaScript(resolvedImport) && !utils_1.isTypescriptDeclaration(sourceName)) {
                            if (!_this._typings[resolvedImport]) {
                                _this._typings[resolvedImport] = _this.resolveTyping(importName, sourceName)
                                    .then(function (resolvedTyping) {
                                    return resolvedTyping ? resolvedTyping : resolvedImport;
                                });
                            }
                            return _this._typings[resolvedImport];
                        }
                        else {
                            return resolvedImport;
                        }
                    });
                };
                TypeChecker.prototype.resolveTyping = function (importName, sourceName) {
                    var _this = this;
                    var packageName = importName.split(/\//)[0];
                    return this._resolve(packageName, sourceName)
                        .then(function (exported) {
                        return exported.slice(0, -3) + "/package.json";
                    })
                        .then(function (address) {
                        return _this._fetch(address)
                            .then(function (packageText) {
                            var typings = JSON.parse(packageText).typings;
                            return typings ? _this._resolve("./" + typings, address) : undefined;
                        })
                            .catch(function (err) {
                            logger.warn("unable to resolve typings for " + importName + ", " + address + " could not be found");
                            return undefined;
                        });
                    });
                };
                TypeChecker.prototype.canEmit = function (file, seen) {
                    var _this = this;
                    seen = seen || [];
                    if (seen.indexOf(file) < 0) {
                        seen.push(file);
                        return file.loaded.then(function () { return Promise.all(file.deps.map(function (dep) { return _this.canEmit(dep, seen); })); });
                    }
                };
                TypeChecker.prototype.accumulateDeps = function (file, result) {
                    var _this = this;
                    result = result || [];
                    if (result.indexOf(file) < 0) {
                        result.push(file);
                        file.deps.forEach(function (dep) { return _this.accumulateDeps(dep, result); });
                    }
                    return result;
                };
                TypeChecker.prototype.getAllDiagnostics = function (file) {
                    var _this = this;
                    var deps = this.accumulateDeps(file);
                    var filelist = deps.map(function (dep) { return dep.sourceName; }).concat([compiler_host_1.__HTML_MODULE__]);
                    var program = ts.createProgram(filelist, this._options, this._host);
                    return deps.reduce(function (diags, dep) {
                        if (!dep.checked) {
                            var sourceFile = _this._host.getSourceFile(dep.sourceName);
                            diags = diags
                                .concat(program.getSyntacticDiagnostics(sourceFile))
                                .concat(program.getSemanticDiagnostics(sourceFile));
                            dep.checked = true;
                        }
                        return diags;
                    }, program.getGlobalDiagnostics());
                };
                return TypeChecker;
            })();
            exports_1("TypeChecker", TypeChecker);
            Deferred = (function () {
                function Deferred() {
                    var _this = this;
                    this.promise = new Promise(function (resolve, reject) {
                        _this.resolve = resolve;
                        _this.reject = reject;
                    });
                }
                return Deferred;
            })();
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZS1jaGVja2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3R5cGUtY2hlY2tlci50cyJdLCJuYW1lcyI6WyJUeXBlQ2hlY2tlciIsIlR5cGVDaGVja2VyLmNvbnN0cnVjdG9yIiwiVHlwZUNoZWNrZXIuY2hlY2siLCJUeXBlQ2hlY2tlci5yZWdpc3RlckRlY2xhcmF0aW9uRmlsZSIsIlR5cGVDaGVja2VyLnJlZ2lzdGVyRmlsZSIsIlR5cGVDaGVja2VyLnJlZ2lzdGVyU291cmNlIiwiVHlwZUNoZWNrZXIucmVzb2x2ZURlcGVuZGVuY2llcyIsIlR5cGVDaGVja2VyLnJlc29sdmVSZWZlcmVuY2UiLCJUeXBlQ2hlY2tlci5yZXNvbHZlSW1wb3J0IiwiVHlwZUNoZWNrZXIucmVzb2x2ZVR5cGluZyIsIlR5cGVDaGVja2VyLmNhbkVtaXQiLCJUeXBlQ2hlY2tlci5hY2N1bXVsYXRlRGVwcyIsIlR5cGVDaGVja2VyLmdldEFsbERpYWdub3N0aWNzIiwiRGVmZXJyZWQiLCJEZWZlcnJlZC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7UUFXSSxNQUFNOzs7Ozs7Ozs7Ozs7Ozs7O1lBQU4sTUFBTSxHQUFHLElBQUksZ0JBQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBVzFDO2dCQVNDQSxxQkFBWUEsSUFBa0JBLEVBQUVBLE9BQXdCQSxFQUFFQSxLQUFvQkE7b0JBQzdFQyxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtvQkFDbEJBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLE9BQU9BLENBQUNBO29CQUN4QkEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0E7b0JBRWhCQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFTQSxFQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtvQkFDeERBLElBQUlBLENBQUNB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QSxDQUFDQTtpQ0FDbkRBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLHNCQUFzQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBRXJEQSxHQUFHQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQTt3QkFDcEJBLENBQUNBO3dCQUNEQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtvQkFDZEEsQ0FBQ0EsRUFBRUEsT0FBT0EsQ0FBQ0Esb0JBQW9CQSxFQUFFQSxDQUFDQSxDQUFDQTtnQkFDcENBLENBQUNBO2dCQUNGWixrQkFBQ0E7WUFBREEsQ0FBQ0EsQUExT0QsSUEwT0M7WUExT0QscUNBME9DLENBQUE7WUFFRDtnQkFLQ2E7b0JBTERDLGlCQVdDQTtvQkFMQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsT0FBT0EsQ0FBSUEsVUFBQ0EsT0FBT0EsRUFBRUEsTUFBTUE7d0JBQzdDQSxLQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxPQUFPQSxDQUFDQTt3QkFDdkJBLEtBQUlBLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBO29CQUN0QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ0pBLENBQUNBO2dCQUNGRCxlQUFDQTtZQUFEQSxDQUFDQSxBQVhELElBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgTG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCB7Q29tcGlsZXJIb3N0LCBDb21iaW5lZE9wdGlvbnN9IGZyb20gJy4vY29tcGlsZXItaG9zdCc7XG5pbXBvcnQge2Zvcm1hdEVycm9yc30gZnJvbSAnLi9mb3JtYXQtZXJyb3JzJztcbmltcG9ydCB7XG5cdGlzVHlwZXNjcmlwdCwgaXNUeXBlc2NyaXB0RGVjbGFyYXRpb24sXG5cdGlzSmF2YVNjcmlwdCwgaXNSZWxhdGl2ZSxcblx0aXNBbWJpZW50LCBpc0FtYmllbnRJbXBvcnR9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQge19fSFRNTF9NT0RVTEVfX30gZnJvbSBcIi4vY29tcGlsZXItaG9zdFwiO1xuXG5sZXQgbG9nZ2VyID0gbmV3IExvZ2dlcih7IGRlYnVnOiBmYWxzZSB9KTtcblxuaW50ZXJmYWNlIEZpbGVFbnRyeSB7XG5cdHNvdXJjZU5hbWU6IHN0cmluZztcblx0c291cmNlOiBEZWZlcnJlZDxzdHJpbmc+O1xuXHRkZXBzPzogRmlsZUVudHJ5W107XG5cdGxvYWRlZDogUHJvbWlzZTxhbnk+O1xuXHRlcnJvcnM6IFByb21pc2U8dHMuRGlhZ25vc3RpY1tdPjtcblx0Y2hlY2tlZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFR5cGVDaGVja2VyIHtcblx0cHJpdmF0ZSBfaG9zdDogQ29tcGlsZXJIb3N0O1xuXHRwcml2YXRlIF9yZXNvbHZlOiBSZXNvbHZlRnVuY3Rpb247XG5cdHByaXZhdGUgX2ZldGNoOiBGZXRjaEZ1bmN0aW9uO1xuICAgcHJpdmF0ZSBfb3B0aW9uczogQ29tYmluZWRPcHRpb25zO1xuXHRwcml2YXRlIF9maWxlczogeyBbczogc3RyaW5nXTogRmlsZUVudHJ5OyB9OyAvLyBNYXA8c3RyaW5nLCBGaWxlRW50cnk+O1xuXHRwcml2YXRlIF9kZWNsYXJhdGlvbkZpbGVzOiBGaWxlRW50cnlbXTtcblx0cHJpdmF0ZSBfdHlwaW5nczogeyBbczogc3RyaW5nXTogUHJvbWlzZTxzdHJpbmc+OyB9OyAvL01hcDxzdHJpbmcsIHN0cmluZz47XG5cblx0Y29uc3RydWN0b3IoaG9zdDogQ29tcGlsZXJIb3N0LCByZXNvbHZlOiBSZXNvbHZlRnVuY3Rpb24sIGZldGNoOiBGZXRjaEZ1bmN0aW9uKSB7XG5cdFx0dGhpcy5faG9zdCA9IGhvc3Q7XG5cdFx0dGhpcy5fcmVzb2x2ZSA9IHJlc29sdmU7XG5cdFx0dGhpcy5fZmV0Y2ggPSBmZXRjaDtcblxuICAgICAgdGhpcy5fb3B0aW9ucyA9ICg8YW55PnRzKS5jbG9uZSh0aGlzLl9ob3N0Lm9wdGlvbnMpO1xuXHRcdHRoaXMuX29wdGlvbnMuaW5saW5lU291cmNlTWFwID0gZmFsc2U7XG5cdFx0dGhpcy5fb3B0aW9ucy5zb3VyY2VNYXAgPSBmYWxzZTtcblx0XHR0aGlzLl9vcHRpb25zLmRlY2xhcmF0aW9uID0gZmFsc2U7XG5cdFx0dGhpcy5fb3B0aW9ucy5pc29sYXRlZE1vZHVsZXMgPSBmYWxzZTtcblx0XHR0aGlzLl9vcHRpb25zLnNraXBEZWZhdWx0TGliQ2hlY2sgPSB0cnVlOyAvLyBkb24ndCBjaGVjayB0aGUgZGVmYXVsdCBsaWIgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuXG5cdFx0Ly8gbWFwIG9mIGFsbCB0eXBlc2NyaXB0IGZpbGVzIC0+IGZpbGUtZW50cnlcblx0XHR0aGlzLl9maWxlcyA9IHt9OyAvL25ldyBNYXA8c3RyaW5nLCBGaWxlRW50cnk+KCk7XG5cblx0XHQvLyBsaXN0IG9mIGFsbCByZWdpc3RlcmVkIGRlY2xhcmF0aW9uIGZpbGVzXG5cdFx0dGhpcy5fZGVjbGFyYXRpb25GaWxlcyA9IFtdO1xuXG5cdFx0Ly8gbWFwIG9mIGV4dGVybmFsIG1vZHVsZXMgdG8gdGhlaXIgdHlwaW5nc1xuXHRcdHRoaXMuX3R5cGluZ3MgPSB7fTsgLy9uZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXHR9XG5cblx0Lypcblx0XHRyZXR1cm5zIGEgcHJvbWlzZSB0byBhbiBhcnJheSBvZiB0eXBlc2NyaXB0IGVycm9ycyBmb3IgdGhpcyBmaWxlXG5cdCovXG5cdHB1YmxpYyBjaGVjayhzb3VyY2VOYW1lOiBzdHJpbmcsIHNvdXJjZTogc3RyaW5nKTogUHJvbWlzZTx0cy5EaWFnbm9zdGljW10+IHtcblx0XHR2YXIgZmlsZSA9IHRoaXMucmVnaXN0ZXJGaWxlKHNvdXJjZU5hbWUpO1xuXHRcdHRoaXMucmVnaXN0ZXJTb3VyY2Uoc291cmNlTmFtZSwgc291cmNlKTtcblx0XHRyZXR1cm4gZmlsZS5lcnJvcnM7XG5cdH1cblxuXHQvKlxuXHRcdHJlZ2lzdGVyIGRlY2xhcmF0aW9uIGZpbGVzIGZyb20gY29uZmlnXG5cdCovXG5cdHB1YmxpYyByZWdpc3RlckRlY2xhcmF0aW9uRmlsZShzb3VyY2VOYW1lOiBzdHJpbmcsIGlzRGVmYXVsdExpYjogYm9vbGVhbikge1xuXHRcdGxldCBmaWxlID0gdGhpcy5yZWdpc3RlckZpbGUoc291cmNlTmFtZSwgaXNEZWZhdWx0TGliKTtcblx0XHR0aGlzLl9kZWNsYXJhdGlvbkZpbGVzLnB1c2goZmlsZSk7XG5cdH1cblxuXHQvKiBwcml2YXRlIG1ldGhvZHMgKi9cblxuXHRwcml2YXRlIHJlZ2lzdGVyRmlsZShzb3VyY2VOYW1lOiBzdHJpbmcsIGlzRGVmYXVsdExpYjogYm9vbGVhbiA9IGZhbHNlKTogRmlsZUVudHJ5IHtcblx0XHRpZiAoIXRoaXMuX2ZpbGVzW3NvdXJjZU5hbWVdKSB7XG5cdFx0XHRsZXQgc291cmNlID0gbmV3IERlZmVycmVkPHN0cmluZz4oKTtcblxuXHRcdFx0Lyogd2UgbmVlZCB0byBmZXRjaCBkZWNsYXJhdGlvbiBmaWxlcyBvdXJzZWx2ZXMgKi9cblx0XHRcdGlmIChpc1R5cGVzY3JpcHREZWNsYXJhdGlvbihzb3VyY2VOYW1lKSkge1xuXHRcdFx0XHR0aGlzLl9mZXRjaChzb3VyY2VOYW1lKVxuXHRcdFx0XHRcdC50aGVuKChzb3VyY2UpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMuX2hvc3QuYWRkRmlsZShzb3VyY2VOYW1lLCBzb3VyY2UsIGlzRGVmYXVsdExpYik7XG5cdFx0XHRcdFx0XHR0aGlzLnJlZ2lzdGVyU291cmNlKHNvdXJjZU5hbWUsIHNvdXJjZSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZXJyID0+IHtcblx0XHRcdFx0XHRcdGxvZ2dlci5lcnJvcihlcnIubWVzc2FnZSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qIGxvYWRlZCBpcyBhIHByb21pc2UgcmVzb2x2ZWQgd2hlbiB0aGUgc291cmNlIGhhcyBiZWVuIGFkZGVkIHRvIHRoZVxuXHRcdFx0XHRob3N0IGFuZCBhbGwgdGhlIGRlcGVuZGVuY2llcyB1c2VkIGJ5IHRoaXMgZmlsZSBoYXZlIGJlZW4gcmVzb2x2ZWQgKi9cblx0XHRcdGxldCBsb2FkZWQgPSBzb3VyY2UucHJvbWlzZVxuXHRcdFx0XHQudGhlbigoc291cmNlKSA9PiB0aGlzLnJlc29sdmVEZXBlbmRlbmNpZXMoc291cmNlTmFtZSwgc291cmNlKSlcblx0XHRcdFx0LnRoZW4oKGRlcHNNYXApID0+IHtcblx0XHRcdFx0XHR0aGlzLl9ob3N0LmFkZFJlc29sdXRpb25NYXAoc291cmNlTmFtZSwgZGVwc01hcCk7XG5cblx0XHRcdFx0XHR0aGlzLl9maWxlc1tzb3VyY2VOYW1lXS5kZXBzID0gT2JqZWN0LmtleXMoZGVwc01hcClcblx0XHRcdFx0XHRcdC5tYXAoKGtleSkgPT4gZGVwc01hcFtrZXldKVxuXHRcdFx0XHRcdFx0LmZpbHRlcigocmVzKSA9PiBpc1R5cGVzY3JpcHQocmVzKSkgLy8gaWdub3JlIGUuZy4ganMsIGNzcyBmaWxlc1xuXHRcdFx0XHRcdFx0Lm1hcCgocmVzKSA9PiB0aGlzLnJlZ2lzdGVyRmlsZShyZXMpKVxuXHRcdFx0XHRcdFx0LmNvbmNhdCh0aGlzLl9kZWNsYXJhdGlvbkZpbGVzKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdC8qIGVycm9ycyBpcyBhIHByb21pc2UgdG8gdGhlIGNvbXBpbGF0aW9uIHJlc3VsdHMgKi9cblx0XHRcdGxldCBlcnJvcnMgPSBsb2FkZWRcblx0XHRcdFx0LnRoZW4oKCkgPT4gdGhpcy5jYW5FbWl0KHRoaXMuX2ZpbGVzW3NvdXJjZU5hbWVdKSlcblx0XHRcdFx0LnRoZW4oKCkgPT4gdGhpcy5nZXRBbGxEaWFnbm9zdGljcyh0aGlzLl9maWxlc1tzb3VyY2VOYW1lXSkpO1xuXG5cdFx0XHR0aGlzLl9maWxlc1tzb3VyY2VOYW1lXSA9IHtcblx0XHRcdFx0c291cmNlTmFtZSxcblx0XHRcdFx0c291cmNlLFxuXHRcdFx0XHRsb2FkZWQsXG5cdFx0XHRcdGVycm9ycyxcblx0XHRcdFx0Y2hlY2tlZDogZmFsc2UsXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9maWxlc1tzb3VyY2VOYW1lXTtcblx0fVxuXG5cdHByaXZhdGUgcmVnaXN0ZXJTb3VyY2Uoc291cmNlTmFtZTogc3RyaW5nLCBzb3VyY2U6IHN0cmluZykge1xuXHRcdGlmICghdGhpcy5fZmlsZXNbc291cmNlTmFtZV0pXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYCR7c291cmNlTmFtZX0gaGFzIG5vdCBiZWVuIHJlZ2lzdGVyZWRgKTtcblxuXHRcdHRoaXMuX2ZpbGVzW3NvdXJjZU5hbWVdLnNvdXJjZS5yZXNvbHZlKHNvdXJjZSk7XG5cdH1cblxuXHQvKlxuXHRcdHByb2Nlc3MgdGhlIHNvdXJjZSB0byBnZXQgaXRzIGRlcGVuZGVuY2llcyBhbmQgcmVzb2x2ZSBhbmQgcmVnaXN0ZXIgdGhlbVxuXHRcdHJldHVybnMgYSBwcm9taXNlIHRvIHRoZSBsaXN0IG9mIHJlZ2lzdGVyZWQgZGVwZW5kZW5jeSBmaWxlc1xuXHQqL1xuXHRwcml2YXRlIHJlc29sdmVEZXBlbmRlbmNpZXMoc291cmNlTmFtZTogc3RyaW5nLCBzb3VyY2U6IHN0cmluZyk6IFByb21pc2U8TWFwPHN0cmluZywgc3RyaW5nPj4ge1xuXHRcdGxldCBpbmZvID0gdHMucHJlUHJvY2Vzc0ZpbGUoc291cmNlLCB0cnVlKTtcblxuXHRcdC8qIGJ1aWxkIHRoZSBsaXN0IG9mIGZpbGUgcmVzb2x1dGlvbnMgKi9cblx0XHQvKiByZWZlcmVuY2VzIGZpcnN0ICovXG5cdFx0bGV0IHJlc29sdmVkUmVmZXJlbmNlcyA9IGluZm8ucmVmZXJlbmNlZEZpbGVzXG5cdFx0XHQubWFwKChyZWYpID0+IHRoaXMucmVzb2x2ZVJlZmVyZW5jZShyZWYuZmlsZU5hbWUsIHNvdXJjZU5hbWUpKTtcblxuXHRcdGxldCByZXNvbHZlZEltcG9ydHMgPSBpbmZvLmltcG9ydGVkRmlsZXNcblx0XHRcdC5tYXAoKGltcCkgPT4gdGhpcy5yZXNvbHZlSW1wb3J0KGltcC5maWxlTmFtZSwgc291cmNlTmFtZSkpO1xuXG5cdFx0bGV0IHJlZnMgPSBbXS5jb25jYXQoaW5mby5yZWZlcmVuY2VkRmlsZXMpLmNvbmNhdChpbmZvLmltcG9ydGVkRmlsZXMpLm1hcChwcmUgPT4gcHJlLmZpbGVOYW1lKTtcblx0XHRsZXQgZGVwcyA9IHJlc29sdmVkUmVmZXJlbmNlcy5jb25jYXQocmVzb2x2ZWRJbXBvcnRzKTtcblxuXHRcdC8qIGFuZCBjb252ZXJ0IHRvIHByb21pc2UgdG8gYSBtYXAgb2YgbG9jYWwgcmVmZXJlbmNlIHRvIHJlc29sdmVkIGRlcGVuZGVuY3kgKi9cblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoZGVwcylcblx0XHRcdC50aGVuKChyZXNvbHZlZCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gcmVmcy5yZWR1Y2UoKHJlc3VsdCwgcmVmLCBpZHgpID0+IHtcblx0XHRcdFx0XHRyZXN1bHRbcmVmXSA9IHJlc29sdmVkW2lkeF07XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fSwge30pO1xuXHRcdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIHJlc29sdmVSZWZlcmVuY2UocmVmZXJlbmNlTmFtZTogc3RyaW5nLCBzb3VyY2VOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdGlmICgoaXNBbWJpZW50KHJlZmVyZW5jZU5hbWUpICYmICF0aGlzLl9vcHRpb25zLnJlc29sdmVBbWJpZW50UmVmcykgfHwgKHJlZmVyZW5jZU5hbWUuaW5kZXhPZihcIi9cIikgPT09IC0xKSlcblx0XHRcdHJlZmVyZW5jZU5hbWUgPSBcIi4vXCIgKyByZWZlcmVuY2VOYW1lO1xuXG5cdFx0cmV0dXJuIHRoaXMuX3Jlc29sdmUocmVmZXJlbmNlTmFtZSwgc291cmNlTmFtZSk7XG5cdH1cblxuXHRwcml2YXRlIHJlc29sdmVJbXBvcnQoaW1wb3J0TmFtZTogc3RyaW5nLCBzb3VyY2VOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdGlmIChpc1JlbGF0aXZlKGltcG9ydE5hbWUpICYmICBpc1R5cGVzY3JpcHREZWNsYXJhdGlvbihzb3VyY2VOYW1lKSAmJiAhaXNUeXBlc2NyaXB0RGVjbGFyYXRpb24oaW1wb3J0TmFtZSkpXG5cdFx0XHRpbXBvcnROYW1lID0gaW1wb3J0TmFtZSArIFwiLmQudHNcIjtcblxuXHRcdHJldHVybiB0aGlzLl9yZXNvbHZlKGltcG9ydE5hbWUsIHNvdXJjZU5hbWUpXG5cdFx0XHQudGhlbihyZXNvbHZlZEltcG9ydCA9PiB7XG5cdFx0XHQgIFx0aWYgKHRoaXMuX29wdGlvbnMucmVzb2x2ZVR5cGluZ3MgJiYgaXNBbWJpZW50SW1wb3J0KGltcG9ydE5hbWUpICYmIGlzSmF2YVNjcmlwdChyZXNvbHZlZEltcG9ydCkgJiYgIWlzVHlwZXNjcmlwdERlY2xhcmF0aW9uKHNvdXJjZU5hbWUpKSB7XG5cdFx0XHQgIFx0XHRpZiAoIXRoaXMuX3R5cGluZ3NbcmVzb2x2ZWRJbXBvcnRdKSB7XG5cdFx0XHRcdFx0XHR0aGlzLl90eXBpbmdzW3Jlc29sdmVkSW1wb3J0XSA9IHRoaXMucmVzb2x2ZVR5cGluZyhpbXBvcnROYW1lLCBzb3VyY2VOYW1lKVxuXHRcdFx0XHRcdFx0XHQudGhlbihyZXNvbHZlZFR5cGluZyA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHJlc29sdmVkVHlwaW5nID8gcmVzb2x2ZWRUeXBpbmcgOiByZXNvbHZlZEltcG9ydDtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuX3R5cGluZ3NbcmVzb2x2ZWRJbXBvcnRdO1xuXHRcdFx0ICBcdH1cblx0XHRcdCAgXHRlbHNlIHtcblx0XHRcdCAgXHRcdHJldHVybiByZXNvbHZlZEltcG9ydDtcblx0XHRcdCAgXHR9XG4gIFx0XHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSByZXNvbHZlVHlwaW5nKGltcG9ydE5hbWU6IHN0cmluZywgc291cmNlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHQvLyB3ZSBjYW4gb25seSBzdXBwb3J0IHBhY2thZ2VzIHJlZ2lzdGVyZWQgd2l0aG91dCBhIHNsYXNoIGluIHRoZW1cblx0XHRsZXQgcGFja2FnZU5hbWUgPSBpbXBvcnROYW1lLnNwbGl0KC9cXC8vKVswXTtcblxuXHRcdHJldHVybiB0aGlzLl9yZXNvbHZlKHBhY2thZ2VOYW1lLCBzb3VyY2VOYW1lKVxuXHRcdFx0LnRoZW4oZXhwb3J0ZWQgPT4ge1xuXHRcdFx0XHRyZXR1cm4gZXhwb3J0ZWQuc2xpY2UoMCwgLTMpICsgXCIvcGFja2FnZS5qc29uXCI7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oYWRkcmVzcyA9PiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9mZXRjaChhZGRyZXNzKVxuXHRcdFx0XHRcdC50aGVuKHBhY2thZ2VUZXh0ID0+IHtcblx0XHRcdFx0XHRcdGxldCB0eXBpbmdzID0gSlNPTi5wYXJzZShwYWNrYWdlVGV4dCkudHlwaW5ncztcblx0XHRcdFx0XHRcdHJldHVybiB0eXBpbmdzID8gdGhpcy5fcmVzb2x2ZShcIi4vXCIgKyB0eXBpbmdzLCBhZGRyZXNzKSA6IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChlcnIgPT4ge1xuXHRcdFx0XHRcdFx0bG9nZ2VyLndhcm4oYHVuYWJsZSB0byByZXNvbHZlIHR5cGluZ3MgZm9yICR7aW1wb3J0TmFtZX0sICR7YWRkcmVzc30gY291bGQgbm90IGJlIGZvdW5kYCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvKlxuXHRcdHJldHVybnMgcHJvbWlzZSByZXNvbHZlZCB3aGVuIGZpbGUgY2FuIGJlIGVtaXR0ZWRcblx0Ki9cblx0cHJpdmF0ZSBjYW5FbWl0KGZpbGU6IEZpbGVFbnRyeSwgc2Vlbj86IEZpbGVFbnRyeVtdKTogUHJvbWlzZTxhbnk+IHtcblx0XHQvKiBhdm9pZCBjaXJjdWxhciByZWZlcmVuY2VzICovXG5cdFx0c2VlbiA9IHNlZW4gfHwgW107XG5cblx0XHRpZiAoc2Vlbi5pbmRleE9mKGZpbGUpIDwgMCkge1xuXHRcdFx0c2Vlbi5wdXNoKGZpbGUpO1xuXG5cdFx0XHRyZXR1cm4gZmlsZS5sb2FkZWQudGhlbigoKSA9PiBQcm9taXNlLmFsbChmaWxlLmRlcHMubWFwKChkZXApID0+IHRoaXMuY2FuRW1pdChkZXAsIHNlZW4pKSkpO1xuXHRcdH1cblx0fVxuXG5cdC8qXG5cdFx0UmV0dXJucyBhIGZsYXR0ZW5lZCBsaXN0IG9mIHRoZSBkZXBlbmRlbmN5IHRyZWUgZm9yIHRoaXMgZmlsZS5cblx0Ki9cblx0cHJpdmF0ZSBhY2N1bXVsYXRlRGVwcyhmaWxlOiBGaWxlRW50cnksIHJlc3VsdD86IEZpbGVFbnRyeVtdKTogRmlsZUVudHJ5W10ge1xuXHRcdHJlc3VsdCA9IHJlc3VsdCB8fCBbXTtcblxuXHRcdGlmIChyZXN1bHQuaW5kZXhPZihmaWxlKSA8IDApIHtcblx0XHRcdHJlc3VsdC5wdXNoKGZpbGUpO1xuXHRcdFx0ZmlsZS5kZXBzLmZvckVhY2goKGRlcCkgPT4gdGhpcy5hY2N1bXVsYXRlRGVwcyhkZXAsIHJlc3VsdCkpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKlxuXHRcdFJldHVybnMgdGhlIGRpYWdub3N0aWNzIGZvciB0aGlzIGZpbGUgYW5kIGFueSBmaWxlcyB3aGljaCBpdCB1c2VzLlxuXHRcdEVhY2ggZmlsZSBpcyBvbmx5IGNoZWNrZWQgb25jZS5cblx0Ki9cblx0cHJpdmF0ZSBnZXRBbGxEaWFnbm9zdGljcyhmaWxlOiBGaWxlRW50cnkpOiB0cy5EaWFnbm9zdGljW10ge1xuXHRcdGxldCBkZXBzID0gdGhpcy5hY2N1bXVsYXRlRGVwcyhmaWxlKTtcblxuXHRcdC8vIGhhY2sgdG8gc3VwcG9ydCBodG1sIGltcG9ydHNcblx0XHRsZXQgZmlsZWxpc3QgPSBkZXBzLm1hcCgoZGVwKSA9PiBkZXAuc291cmNlTmFtZSkuY29uY2F0KFtfX0hUTUxfTU9EVUxFX19dKTtcblx0XHRsZXQgcHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0oZmlsZWxpc3QsIHRoaXMuX29wdGlvbnMsIHRoaXMuX2hvc3QpO1xuXG5cdFx0cmV0dXJuIGRlcHMucmVkdWNlKChkaWFncywgZGVwKSA9PiB7XG5cdFx0XHRpZiAoIWRlcC5jaGVja2VkKSB7XG5cdFx0XHRcdGxldCBzb3VyY2VGaWxlID0gdGhpcy5faG9zdC5nZXRTb3VyY2VGaWxlKGRlcC5zb3VyY2VOYW1lKTtcblxuXHRcdFx0XHRkaWFncyA9IGRpYWdzXG5cdFx0XHRcdFx0LmNvbmNhdChwcm9ncmFtLmdldFN5bnRhY3RpY0RpYWdub3N0aWNzKHNvdXJjZUZpbGUpKVxuXHRcdFx0XHRcdC5jb25jYXQocHJvZ3JhbS5nZXRTZW1hbnRpY0RpYWdub3N0aWNzKHNvdXJjZUZpbGUpKTtcblxuXHRcdFx0XHRkZXAuY2hlY2tlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZGlhZ3M7XG5cdFx0fSwgcHJvZ3JhbS5nZXRHbG9iYWxEaWFnbm9zdGljcygpKTtcblx0fVxufVxuXG5jbGFzcyBEZWZlcnJlZDxUPiB7XG5cdHB1YmxpYyByZXNvbHZlOiAocmVzdWx0OiBUKSA9PiB2b2lkO1xuXHRwdWJsaWMgcmVqZWN0OiAoZXJyOiBFcnJvcikgPT4gdm9pZDtcblx0cHVibGljIHByb21pc2U6IFByb21pc2U8VD47XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5wcm9taXNlID0gbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0dGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcblx0XHRcdHRoaXMucmVqZWN0ID0gcmVqZWN0O1xuXHRcdH0pO1xuXHR9XG59XG4iXX0=