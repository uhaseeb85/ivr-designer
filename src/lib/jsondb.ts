import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Define database file paths
const DB_FILES = {
  users: path.join(DATA_DIR, 'users.json'),
  projects: path.join(DATA_DIR, 'projects.json'),
  tokens: path.join(DATA_DIR, 'tokens.json'),
  flows: path.join(DATA_DIR, 'flows.json'),
  nodes: path.join(DATA_DIR, 'nodes.json'),
};

// Initialize JSON files if they don't exist
Object.entries(DB_FILES).forEach(([_, filePath]) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
});

// Helper function to read from JSON file
const readJsonFile = (filePath: string) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
};

// Helper function to write to JSON file
const writeJsonFile = (filePath: string, data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error);
    return false;
  }
};

// Generate a unique ID (simulating MongoDB ObjectId)
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Database operations for each model
const jsonDb = {
  // User operations
  user: {
    findMany: () => readJsonFile(DB_FILES.users),
    
    findUnique: (criteria: any) => {
      const users = readJsonFile(DB_FILES.users);
      return users.find((user: any) => 
        Object.entries(criteria).every(([key, value]) => user[key] === value)
      );
    },
    
    create: (data: any) => {
      const users = readJsonFile(DB_FILES.users);
      const newUser = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(newUser);
      writeJsonFile(DB_FILES.users, users);
      return newUser;
    },
    
    update: (criteria: any, data: any) => {
      const users = readJsonFile(DB_FILES.users);
      const index = users.findIndex((user: any) => 
        Object.entries(criteria).every(([key, value]) => user[key] === value)
      );
      
      if (index !== -1) {
        users[index] = {
          ...users[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
        writeJsonFile(DB_FILES.users, users);
        return users[index];
      }
      return null;
    },
    
    delete: (criteria: any) => {
      const users = readJsonFile(DB_FILES.users);
      const filteredUsers = users.filter((user: any) => 
        !Object.entries(criteria).every(([key, value]) => user[key] === value)
      );
      
      if (filteredUsers.length < users.length) {
        writeJsonFile(DB_FILES.users, filteredUsers);
        return true;
      }
      return false;
    }
  },
  
  // Project operations
  project: {
    findMany: (criteria?: any) => {
      const projects = readJsonFile(DB_FILES.projects);
      if (!criteria) return projects;
      
      return projects.filter((project: any) => 
        Object.entries(criteria).every(([key, value]) => project[key] === value)
      );
    },
    
    findUnique: (criteria: any) => {
      const projects = readJsonFile(DB_FILES.projects);
      return projects.find((project: any) => 
        Object.entries(criteria).every(([key, value]) => project[key] === value)
      );
    },
    
    create: (data: any) => {
      const projects = readJsonFile(DB_FILES.projects);
      const newProject = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      projects.push(newProject);
      writeJsonFile(DB_FILES.projects, projects);
      return newProject;
    },
    
    update: (criteria: any, data: any) => {
      const projects = readJsonFile(DB_FILES.projects);
      const index = projects.findIndex((project: any) => 
        Object.entries(criteria).every(([key, value]) => project[key] === value)
      );
      
      if (index !== -1) {
        projects[index] = {
          ...projects[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
        writeJsonFile(DB_FILES.projects, projects);
        return projects[index];
      }
      return null;
    },
    
    delete: (criteria: any) => {
      const projects = readJsonFile(DB_FILES.projects);
      const filteredProjects = projects.filter((project: any) => 
        !Object.entries(criteria).every(([key, value]) => project[key] === value)
      );
      
      if (filteredProjects.length < projects.length) {
        writeJsonFile(DB_FILES.projects, filteredProjects);
        return true;
      }
      return false;
    }
  },
  
  // Similar operations for tokens, flows, and nodes
  token: {
    findMany: (criteria?: any) => {
      const tokens = readJsonFile(DB_FILES.tokens);
      if (!criteria) return tokens;
      
      return tokens.filter((token: any) => 
        Object.entries(criteria).every(([key, value]) => token[key] === value)
      );
    },
    
    findUnique: (criteria: any) => {
      const tokens = readJsonFile(DB_FILES.tokens);
      return tokens.find((token: any) => 
        Object.entries(criteria).every(([key, value]) => token[key] === value)
      );
    },
    
    create: (data: any) => {
      const tokens = readJsonFile(DB_FILES.tokens);
      const newToken = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      tokens.push(newToken);
      writeJsonFile(DB_FILES.tokens, tokens);
      return newToken;
    },
    
    update: (criteria: any, data: any) => {
      const tokens = readJsonFile(DB_FILES.tokens);
      const index = tokens.findIndex((token: any) => 
        Object.entries(criteria).every(([key, value]) => token[key] === value)
      );
      
      if (index !== -1) {
        tokens[index] = {
          ...tokens[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
        writeJsonFile(DB_FILES.tokens, tokens);
        return tokens[index];
      }
      return null;
    },
    
    delete: (criteria: any) => {
      const tokens = readJsonFile(DB_FILES.tokens);
      const filteredTokens = tokens.filter((token: any) => 
        !Object.entries(criteria).every(([key, value]) => token[key] === value)
      );
      
      if (filteredTokens.length < tokens.length) {
        writeJsonFile(DB_FILES.tokens, filteredTokens);
        return true;
      }
      return false;
    }
  },
  
  flow: {
    findMany: (criteria?: any) => {
      const flows = readJsonFile(DB_FILES.flows);
      if (!criteria) return flows;
      
      return flows.filter((flow: any) => 
        Object.entries(criteria).every(([key, value]) => flow[key] === value)
      );
    },
    
    findUnique: (criteria: any) => {
      const flows = readJsonFile(DB_FILES.flows);
      return flows.find((flow: any) => 
        Object.entries(criteria).every(([key, value]) => flow[key] === value)
      );
    },
    
    create: (data: any) => {
      const flows = readJsonFile(DB_FILES.flows);
      const newFlow = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      flows.push(newFlow);
      writeJsonFile(DB_FILES.flows, flows);
      return newFlow;
    },
    
    update: (criteria: any, data: any) => {
      const flows = readJsonFile(DB_FILES.flows);
      const index = flows.findIndex((flow: any) => 
        Object.entries(criteria).every(([key, value]) => flow[key] === value)
      );
      
      if (index !== -1) {
        flows[index] = {
          ...flows[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
        writeJsonFile(DB_FILES.flows, flows);
        return flows[index];
      }
      return null;
    },
    
    delete: (criteria: any) => {
      const flows = readJsonFile(DB_FILES.flows);
      const filteredFlows = flows.filter((flow: any) => 
        !Object.entries(criteria).every(([key, value]) => flow[key] === value)
      );
      
      if (filteredFlows.length < flows.length) {
        writeJsonFile(DB_FILES.flows, filteredFlows);
        return true;
      }
      return false;
    }
  },
  
  node: {
    findMany: (criteria?: any) => {
      const nodes = readJsonFile(DB_FILES.nodes);
      if (!criteria) return nodes;
      
      return nodes.filter((node: any) => 
        Object.entries(criteria).every(([key, value]) => {
          if (Array.isArray(value)) {
            return JSON.stringify(node[key]) === JSON.stringify(value);
          }
          return node[key] === value;
        })
      );
    },
    
    findUnique: (criteria: any) => {
      const nodes = readJsonFile(DB_FILES.nodes);
      return nodes.find((node: any) => 
        Object.entries(criteria).every(([key, value]) => node[key] === value)
      );
    },
    
    create: (data: any) => {
      const nodes = readJsonFile(DB_FILES.nodes);
      const newNode = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      nodes.push(newNode);
      writeJsonFile(DB_FILES.nodes, nodes);
      return newNode;
    },
    
    update: (criteria: any, data: any) => {
      const nodes = readJsonFile(DB_FILES.nodes);
      const index = nodes.findIndex((node: any) => 
        Object.entries(criteria).every(([key, value]) => node[key] === value)
      );
      
      if (index !== -1) {
        nodes[index] = {
          ...nodes[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
        writeJsonFile(DB_FILES.nodes, nodes);
        return nodes[index];
      }
      return null;
    },
    
    delete: (criteria: any) => {
      const nodes = readJsonFile(DB_FILES.nodes);
      const filteredNodes = nodes.filter((node: any) => 
        !Object.entries(criteria).every(([key, value]) => node[key] === value)
      );
      
      if (filteredNodes.length < nodes.length) {
        writeJsonFile(DB_FILES.nodes, filteredNodes);
        return true;
      }
      return false;
    }
  }
};

export default jsonDb; 