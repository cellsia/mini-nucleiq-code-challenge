/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular-dependencies",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "domain-is-independent",
      severity: "error",
      from: { path: "^src/domain/" },
      to: { path: "^src/(application|adapters)/" },
    },
    {
      name: "application-does-not-depend-on-adapters",
      severity: "error",
      from: { path: "^src/application/" },
      to: { path: "^src/adapters/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
  },
};
