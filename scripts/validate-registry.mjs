#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const registryPath = path.join(root, 'registry', 'skills.json');
const profilesDir = path.join(root, 'profiles');
const localSkillsDir = path.join(root, 'skills');

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`Invalid JSON: ${path.relative(root, filePath)} (${error.message})`);
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateRegistry(registry) {
  if (!registry || typeof registry !== 'object' || Array.isArray(registry)) {
    fail('registry/skills.json must contain a JSON object.');
    return new Map();
  }

  if (!Number.isInteger(registry.version) || registry.version < 1) {
    fail('registry.version must be an integer >= 1.');
  }

  if (!Array.isArray(registry.skills)) {
    fail('registry.skills must be an array.');
    return new Map();
  }

  const allowedTiers = new Set(['S+', 'S', 'A+', 'A', 'B']);
  const idPattern = /^[a-z0-9][a-z0-9-]*$/;
  const sourcePattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
  const categoryPattern = /^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/;
  const skillMap = new Map();

  registry.skills.forEach((skill, index) => {
    const label = `registry.skills[${index}]`;

    if (!skill || typeof skill !== 'object' || Array.isArray(skill)) {
      fail(`${label} must be an object.`);
      return;
    }

    if (!isNonEmptyString(skill.id) || !idPattern.test(skill.id)) {
      fail(`${label}.id must match ${idPattern}.`);
      return;
    }

    if (skillMap.has(skill.id)) {
      fail(`Duplicate skill id: ${skill.id}`);
      return;
    }

    skillMap.set(skill.id, skill);

    if (!isNonEmptyString(skill.name)) {
      fail(`${skill.id}: name is required.`);
    }

    if (!isNonEmptyString(skill.source) || !sourcePattern.test(skill.source)) {
      fail(`${skill.id}: source must use owner/repository format.`);
    }

    if (skill.upstreamPath !== null && !isNonEmptyString(skill.upstreamPath)) {
      fail(`${skill.id}: upstreamPath must be a non-empty string or null.`);
    }

    if (skill.upstreamPath === null) {
      warn(`${skill.id}: upstreamPath is unresolved; weekly path-level update checks must skip it.`);
    }

    if (!isNonEmptyString(skill.category) || !categoryPattern.test(skill.category)) {
      fail(`${skill.id}: invalid category: ${skill.category}`);
    }

    if (!allowedTiers.has(skill.tier)) {
      fail(`${skill.id}: invalid tier: ${skill.tier}`);
    }

    if (typeof skill.official !== 'boolean') {
      fail(`${skill.id}: official must be boolean.`);
    }

    if (typeof skill.enabled !== 'boolean') {
      fail(`${skill.id}: enabled must be boolean.`);
    }

    if (!Array.isArray(skill.profiles)) {
      fail(`${skill.id}: profiles must be an array.`);
    } else {
      const profileSet = new Set();
      for (const profile of skill.profiles) {
        if (!isNonEmptyString(profile) || !idPattern.test(profile)) {
          fail(`${skill.id}: invalid profile name: ${String(profile)}`);
          continue;
        }
        if (profileSet.has(profile)) {
          fail(`${skill.id}: duplicate profile reference: ${profile}`);
        }
        profileSet.add(profile);
      }
    }

    if (!isNonEmptyString(skill.description)) {
      fail(`${skill.id}: description is required.`);
    }

    if (!isNonEmptyString(skill.skillsShUrl)) {
      fail(`${skill.id}: skillsShUrl is required.`);
    } else {
      try {
        const url = new URL(skill.skillsShUrl);
        if (url.protocol !== 'https:') {
          fail(`${skill.id}: skillsShUrl must use HTTPS.`);
        }
      } catch {
        fail(`${skill.id}: skillsShUrl is not a valid URL.`);
      }
    }
  });

  return skillMap;
}

function loadProfiles() {
  if (!fs.existsSync(profilesDir)) {
    fail('profiles/ directory does not exist.');
    return new Map();
  }

  const files = fs
    .readdirSync(profilesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort();

  if (files.length === 0) {
    fail('profiles/ does not contain any JSON profiles.');
  }

  const profiles = new Map();

  for (const file of files) {
    const name = path.basename(file, '.json');
    const profile = readJson(path.join(profilesDir, file));
    if (profile) {
      profiles.set(name, profile);
    }
  }

  return profiles;
}

function validateProfiles(profiles, skillMap) {
  const profileNamePattern = /^[a-z0-9][a-z0-9-]*$/;

  for (const [profileName, profile] of profiles) {
    if (!profileNamePattern.test(profileName)) {
      fail(`Invalid profile filename: ${profileName}.json`);
    }

    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
      fail(`profiles/${profileName}.json must contain an object.`);
      continue;
    }

    if (!Number.isInteger(profile.version) || profile.version < 1) {
      fail(`${profileName}: version must be an integer >= 1.`);
    }

    if (!isNonEmptyString(profile.name)) {
      fail(`${profileName}: name is required.`);
    }

    if (!isNonEmptyString(profile.description)) {
      fail(`${profileName}: description is required.`);
    }

    for (const field of ['extends', 'skills', 'localSkills']) {
      if (!Array.isArray(profile[field])) {
        fail(`${profileName}: ${field} must be an array.`);
      }
    }

    if (!Array.isArray(profile.extends) || !Array.isArray(profile.skills) || !Array.isArray(profile.localSkills)) {
      continue;
    }

    const seenExtends = new Set();
    for (const parent of profile.extends) {
      if (!isNonEmptyString(parent)) {
        fail(`${profileName}: extends contains an invalid value.`);
        continue;
      }
      if (parent === profileName) {
        fail(`${profileName}: profile cannot extend itself.`);
      }
      if (!profiles.has(parent)) {
        fail(`${profileName}: unknown parent profile: ${parent}`);
      }
      if (seenExtends.has(parent)) {
        fail(`${profileName}: duplicate parent profile: ${parent}`);
      }
      seenExtends.add(parent);
    }

    const seenSkills = new Set();
    for (const skillId of profile.skills) {
      if (!isNonEmptyString(skillId)) {
        fail(`${profileName}: skills contains an invalid value.`);
        continue;
      }
      if (!skillMap.has(skillId)) {
        fail(`${profileName}: unknown registry skill: ${skillId}`);
      }
      if (seenSkills.has(skillId)) {
        fail(`${profileName}: duplicate skill: ${skillId}`);
      }
      seenSkills.add(skillId);
    }

    const seenLocalSkills = new Set();
    for (const skillId of profile.localSkills) {
      if (!isNonEmptyString(skillId)) {
        fail(`${profileName}: localSkills contains an invalid value.`);
        continue;
      }
      if (seenLocalSkills.has(skillId)) {
        fail(`${profileName}: duplicate local skill: ${skillId}`);
      }
      seenLocalSkills.add(skillId);

      const skillDir = path.join(localSkillsDir, skillId);
      const skillFile = path.join(skillDir, 'SKILL.md');
      const agentFile = path.join(skillDir, 'agents', 'openai.yaml');

      if (!fs.existsSync(skillFile)) {
        fail(`${profileName}: local skill ${skillId} is missing skills/${skillId}/SKILL.md`);
      }

      if (!fs.existsSync(agentFile)) {
        fail(`${profileName}: local skill ${skillId} is missing skills/${skillId}/agents/openai.yaml`);
      }
    }
  }
}

function validateProfileCycles(profiles) {
  const visiting = new Set();
  const visited = new Set();

  function visit(name, stack) {
    if (visiting.has(name)) {
      const cycleStart = stack.indexOf(name);
      const cycle = [...stack.slice(cycleStart), name].join(' -> ');
      fail(`Profile inheritance cycle detected: ${cycle}`);
      return;
    }

    if (visited.has(name)) {
      return;
    }

    visiting.add(name);
    const profile = profiles.get(name);
    const parents = Array.isArray(profile?.extends) ? profile.extends : [];

    for (const parent of parents) {
      if (profiles.has(parent)) {
        visit(parent, [...stack, name]);
      }
    }

    visiting.delete(name);
    visited.add(name);
  }

  for (const name of profiles.keys()) {
    visit(name, []);
  }
}

function buildEffectiveSkills(profiles) {
  const cache = new Map();

  function resolve(name, stack = new Set()) {
    if (cache.has(name)) {
      return cache.get(name);
    }

    if (stack.has(name)) {
      return new Set();
    }

    const profile = profiles.get(name);
    if (!profile) {
      return new Set();
    }

    const nextStack = new Set(stack);
    nextStack.add(name);

    const result = new Set(Array.isArray(profile.skills) ? profile.skills : []);
    const parents = Array.isArray(profile.extends) ? profile.extends : [];

    for (const parent of parents) {
      for (const skillId of resolve(parent, nextStack)) {
        result.add(skillId);
      }
    }

    cache.set(name, result);
    return result;
  }

  for (const name of profiles.keys()) {
    resolve(name);
  }

  return cache;
}

function validateRegistryProfileSymmetry(registry, profiles) {
  if (!registry || !Array.isArray(registry.skills)) {
    return;
  }

  const effectiveSkills = buildEffectiveSkills(profiles);

  for (const skill of registry.skills) {
    if (!skill || !Array.isArray(skill.profiles) || !isNonEmptyString(skill.id)) {
      continue;
    }

    for (const profileName of skill.profiles) {
      if (!profiles.has(profileName)) {
        fail(`${skill.id}: registry references unknown profile: ${profileName}`);
        continue;
      }

      if (!effectiveSkills.get(profileName)?.has(skill.id)) {
        warn(`${skill.id}: registry lists profile ${profileName}, but the effective profile does not include this skill.`);
      }
    }
  }
}

function printResults(skillMap, profiles) {
  console.log('ADui Skills Pack validation');
  console.log('---------------------------');
  console.log(`Registry skills : ${skillMap.size}`);
  console.log(`Profiles        : ${profiles.size}`);
  console.log(`Warnings        : ${warnings.length}`);
  console.log(`Errors          : ${errors.length}`);

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const message of warnings) {
      console.log(`  - ${message}`);
    }
  }

  if (errors.length > 0) {
    console.error('\nErrors:');
    for (const message of errors) {
      console.error(`  - ${message}`);
    }
  }
}

if (!fs.existsSync(registryPath)) {
  console.error('Missing registry/skills.json');
  process.exit(1);
}

const registry = readJson(registryPath);
const skillMap = validateRegistry(registry);
const profiles = loadProfiles();

validateProfiles(profiles, skillMap);
validateProfileCycles(profiles);
validateRegistryProfileSymmetry(registry, profiles);
printResults(skillMap, profiles);

process.exit(errors.length === 0 ? 0 : 1);
