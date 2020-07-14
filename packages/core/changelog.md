5.1.1
fix: logger can try to invoke before interop is ready
5.1.0
feat: extra performance metrics
feat: respect log level coming from Enterprise configuration
fix: better timeout error message
fix: try to fool webpack when requiring ws module
fix: add legacy methods to glue.agm
chore: upgraded callback-registry to 2.6.0
5.0.7
fix: extra check for running in browser or node
5.0.6
fix: removed module invalid glue42core module export from d.ts
fix: proper error when trying to invoke with circular objects
5.0.5
fix: change metrics service to Glue42
5.0.4
fix: metrics identity was missing service, system, instance
5.0.3
fix: methodDefinition's getServers() listed as property, not method [link](https://github.com/Glue42/core/issues/62)
fix: MethodDefinition.getServers() doesn't return expected array [link](https://github.com/Glue42/core/issues/60)
5.0.2
feat: added in lerna release pipeline
5.0.1
fix: breaks if server returns null object ("server returns null result" test)
5.0.0
BREAKING CHANGE: removed support for Glue42 v2
