export const JOB_ROLES = [
  "Cloud Engineer",
  "DevOps Engineer",
  "Software Tester",
  "Data Analyst",
  "Web Developer",
  "Cyber Security",
  "Digital Marketing",
] as const;

export type PresetRole = (typeof JOB_ROLES)[number];
