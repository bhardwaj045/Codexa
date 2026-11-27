/**
 * Automatic Function Signature & Starter Code Generator
 * Supports Java, C++, C, Python, JavaScript
 */

export const SUPPORTED_LANGUAGES = [
  { id: 'JAVA', name: 'Java', monacoLang: 'java', ext: 'java' },
  { id: 'CPP', name: 'C++', monacoLang: 'cpp', ext: 'cpp' },
  { id: 'C', name: 'C', monacoLang: 'c', ext: 'c' },
  { id: 'PYTHON', name: 'Python', monacoLang: 'python', ext: 'py' },
  { id: 'JAVASCRIPT', name: 'JavaScript', monacoLang: 'javascript', ext: 'js' },
];

export const DATA_TYPES = [
  { id: 'int', label: 'int (Integer)' },
  { id: 'long', label: 'long (Long Integer)' },
  { id: 'double', label: 'double (Floating Point)' },
  { id: 'string', label: 'string (String)' },
  { id: 'boolean', label: 'boolean (Boolean)' },
  { id: 'char', label: 'char (Character)' },
  { id: 'int[]', label: 'int[] (1D Integer Array)' },
  { id: 'long[]', label: 'long[] (1D Long Array)' },
  { id: 'string[]', label: 'string[] (1D String Array)' },
  { id: 'boolean[]', label: 'boolean[] (1D Boolean Array)' },
  { id: 'char[]', label: 'char[] (1D Character Array)' },
  { id: 'int[][]', label: 'int[][] (2D Integer Matrix)' },
  { id: 'char[][]', label: 'char[][] (2D Character Board)' },
  { id: 'string[][]', label: 'string[][] (2D String Matrix)' },
  { id: 'TreeNode', label: 'TreeNode (Binary Tree)' },
  { id: 'ListNode', label: 'ListNode (Linked List)' },
  { id: 'void', label: 'void (No Return Value)' },
  { id: 'custom', label: 'custom (Custom Type)' },
];

/**
 * Generate a URL-friendly slug from title (e.g. "Two Sum" -> "two-sum")
 */
export function generateSlug(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Type mapper for Java
 */
function toJavaType(type) {
  switch (type) {
    case 'int': return 'int';
    case 'long': return 'long';
    case 'double': return 'double';
    case 'string': return 'String';
    case 'boolean': return 'boolean';
    case 'char': return 'char';
    case 'int[]': return 'int[]';
    case 'long[]': return 'long[]';
    case 'string[]': return 'String[]';
    case 'boolean[]': return 'boolean[]';
    case 'char[]': return 'char[]';
    case 'int[][]': return 'int[][]';
    case 'char[][]': return 'char[][]';
    case 'string[][]': return 'String[][]';
    case 'TreeNode': return 'TreeNode';
    case 'ListNode': return 'ListNode';
    case 'void': return 'void';
    default: return type || 'void';
  }
}

/**
 * Type mapper for Python (with typing annotations)
 */
function toPythonType(type) {
  switch (type) {
    case 'int': return 'int';
    case 'long': return 'int';
    case 'double': return 'float';
    case 'string': return 'str';
    case 'boolean': return 'bool';
    case 'char': return 'str';
    case 'int[]': return 'List[int]';
    case 'long[]': return 'List[int]';
    case 'string[]': return 'List[str]';
    case 'boolean[]': return 'List[bool]';
    case 'char[]': return 'List[str]';
    case 'int[][]': return 'List[List[int]]';
    case 'char[][]': return 'List[List[str]]';
    case 'string[][]': return 'List[List[str]]';
    case 'TreeNode': return 'Optional[TreeNode]';
    case 'ListNode': return 'Optional[ListNode]';
    case 'void': return 'None';
    default: return type || 'Any';
  }
}

/**
 * Type mapper for C++
 */
function toCppType(type, isParam = false) {
  switch (type) {
    case 'int': return 'int';
    case 'long': return 'long long';
    case 'double': return 'double';
    case 'string': return isParam ? 'string&' : 'string';
    case 'boolean': return 'bool';
    case 'char': return 'char';
    case 'int[]': return isParam ? 'vector<int>&' : 'vector<int>';
    case 'long[]': return isParam ? 'vector<long long>&' : 'vector<long long>';
    case 'string[]': return isParam ? 'vector<string>&' : 'vector<string>';
    case 'boolean[]': return isParam ? 'vector<bool>&' : 'vector<bool>';
    case 'char[]': return isParam ? 'vector<char>&' : 'vector<char>';
    case 'int[][]': return isParam ? 'vector<vector<int>>&' : 'vector<vector<int>>';
    case 'char[][]': return isParam ? 'vector<vector<char>>&' : 'vector<vector<char>>';
    case 'string[][]': return isParam ? 'vector<vector<string>>&' : 'vector<vector<string>>';
    case 'TreeNode': return 'TreeNode*';
    case 'ListNode': return 'ListNode*';
    case 'void': return 'void';
    default: return type || 'void';
  }
}

/**
 * Type mapper for C
 */
function toCType(type) {
  switch (type) {
    case 'int': return 'int';
    case 'long': return 'long long';
    case 'double': return 'double';
    case 'string': return 'char*';
    case 'boolean': return 'bool';
    case 'char': return 'char';
    case 'int[]': return 'int*';
    case 'long[]': return 'long long*';
    case 'string[]': return 'char**';
    case 'boolean[]': return 'bool*';
    case 'char[]': return 'char*';
    case 'int[][]': return 'int**';
    case 'char[][]': return 'char**';
    case 'string[][]': return 'char***';
    case 'TreeNode': return 'struct TreeNode*';
    case 'ListNode': return 'struct ListNode*';
    case 'void': return 'void';
    default: return type || 'void';
  }
}

/**
 * JSDoc Type mapper for JavaScript
 */
function toJsDocType(type) {
  switch (type) {
    case 'int':
    case 'long':
    case 'double': return 'number';
    case 'string': return 'string';
    case 'boolean': return 'boolean';
    case 'char': return 'string';
    case 'int[]':
    case 'long[]': return 'number[]';
    case 'string[]': return 'string[]';
    case 'boolean[]': return 'boolean[]';
    case 'char[]': return 'string[]';
    case 'int[][]': return 'number[][]';
    case 'char[][]': return 'string[][]';
    case 'string[][]': return 'string[][]';
    case 'TreeNode': return 'TreeNode';
    case 'ListNode': return 'ListNode';
    case 'void': return 'void';
    default: return type || 'any';
  }
}

/**
 * Generate starter template for Java
 */
export function generateJavaTemplate(fnName, returnType, parameters = []) {
  const javaReturn = toJavaType(returnType);
  const javaParams = parameters
    .filter(p => p.name)
    .map(p => `${toJavaType(p.type)} ${p.name}`)
    .join(', ');

  let defaultReturn = '';
  if (javaReturn !== 'void') {
    if (javaReturn === 'boolean') defaultReturn = '        return false;\n';
    else if (javaReturn === 'int' || javaReturn === 'long') defaultReturn = '        return 0;\n';
    else if (javaReturn === 'double') defaultReturn = '        return 0.0;\n';
    else if (javaReturn === 'String') defaultReturn = '        return "";\n';
    else if (javaReturn.endsWith('[]')) defaultReturn = `        return new ${javaReturn.replace('[]', '[0]')};\n`;
    else defaultReturn = '        return null;\n';
  }

  return `class Solution {
    public ${javaReturn} ${fnName || 'solve'}(${javaParams}) {
${defaultReturn}    }
}`;
}

/**
 * Generate starter template for Python
 */
export function generatePythonTemplate(fnName, returnType, parameters = []) {
  const pyReturn = toPythonType(returnType);
  const pyParamsList = ['self'];
  parameters.forEach(p => {
    if (p.name) {
      pyParamsList.push(`${p.name}: ${toPythonType(p.type)}`);
    }
  });
  const pyParams = pyParamsList.join(', ');

  return `class Solution:
    def ${fnName || 'solve'}(${pyParams}) -> ${pyReturn}:
        pass
`;
}

/**
 * Generate starter template for C++
 */
export function generateCppTemplate(fnName, returnType, parameters = []) {
  const cppReturn = toCppType(returnType, false);
  const cppParams = parameters
    .filter(p => p.name)
    .map(p => `${toCppType(p.type, true)} ${p.name}`)
    .join(', ');

  let defaultReturn = '';
  if (cppReturn !== 'void') {
    if (cppReturn === 'bool') defaultReturn = '        return false;\n';
    else if (cppReturn === 'int' || cppReturn === 'long long') defaultReturn = '        return 0;\n';
    else if (cppReturn === 'double') defaultReturn = '        return 0.0;\n';
    else if (cppReturn === 'string') defaultReturn = '        return "";\n';
    else if (cppReturn.startsWith('vector')) defaultReturn = '        return {};\n';
    else defaultReturn = '        return nullptr;\n';
  }

  return `class Solution {
public:
    ${cppReturn} ${fnName || 'solve'}(${cppParams}) {
${defaultReturn}    }
};`;
}

/**
 * Generate starter template for C
 */
export function generateCTemplate(fnName, returnType, parameters = []) {
  const cReturn = toCType(returnType);
  const cParamsList = [];

  parameters.forEach(p => {
    if (p.name) {
      const type = toCType(p.type);
      cParamsList.push(`${type} ${p.name}`);
      // In C, arrays commonly require size companions
      if (p.type.endsWith('[]') && !p.type.endsWith('[][]')) {
        cParamsList.push(`int ${p.name}Size`);
      } else if (p.type.endsWith('[][]')) {
        cParamsList.push(`int ${p.name}Size`);
        cParamsList.push(`int* ${p.name}ColSize`);
      }
    }
  });

  // Array return in C needs returnSize
  if (returnType.endsWith('[]')) {
    cParamsList.push('int* returnSize');
  }

  const cParams = cParamsList.join(', ');
  const headerNotice = returnType.endsWith('[]') 
    ? `/**\n * Note: The returned array must be malloced, assume caller calls free().\n */\n` 
    : '';

  return `${headerNotice}${cReturn} ${fnName || 'solve'}(${cParams}) {
    
}`;
}

/**
 * Generate starter template for JavaScript
 */
export function generateJsTemplate(fnName, returnType, parameters = []) {
  const jsReturn = toJsDocType(returnType);
  const jsDocParams = parameters
    .filter(p => p.name)
    .map(p => ` * @param {${toJsDocType(p.type)}} ${p.name}`)
    .join('\n');
  const jsParams = parameters
    .filter(p => p.name)
    .map(p => p.name)
    .join(', ');

  const jsDocBlock = jsDocParams ? `/**\n${jsDocParams}\n * @return {${jsReturn}}\n */\n` : `/**\n * @return {${jsReturn}}\n */\n`;

  return `${jsDocBlock}var ${fnName || 'solve'} = function(${jsParams}) {
    
};`;
}

/**
 * Generate all 5 language starter code templates in a single map
 */
export function generateAllTemplates({ functionName, returnType, parameters = [] }) {
  const fn = (functionName || 'solve').trim();
  const ret = returnType || 'int';

  return {
    JAVA: generateJavaTemplate(fn, ret, parameters),
    CPP: generateCppTemplate(fn, ret, parameters),
    C: generateCTemplate(fn, ret, parameters),
    PYTHON: generatePythonTemplate(fn, ret, parameters),
    JAVASCRIPT: generateJsTemplate(fn, ret, parameters)
  };
}
