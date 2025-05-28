理解从 code index 的建立开始，到 diff code review 可能的流程

## 简单例子：一个用户管理系统

### 1. **代码结构**
```
src/
├── user/
│   ├── userService.js     // 用户服务
│   ├── userModel.js       // 用户模型
│   └── userController.js  // 用户控制器
├── auth/
│   └── authService.js     // 认证服务
└── utils/
    └── validator.js       // 验证工具
```

### 2. **Code Index 建立过程**

#### 2.1 **文件内容示例**
```javascript
// userService.js
import { validateEmail } from '../utils/validator.js';
import { UserModel } from './userModel.js';

export class UserService {
  async createUser(userData) {
    if (!validateEmail(userData.email)) {
      throw new Error('Invalid email');
    }
    return UserModel.create(userData);
  }
}
```

```javascript
// authService.js  
import { UserService } from '../user/userService.js';

export class AuthService {
  constructor() {
    this.userService = new UserService();
  }
  
  async register(userData) {
    return this.userService.createUser(userData);
  }
}
```

#### 2.2 **Index 建立**
```json
{
  "files": {
    "userService.js": {
      "functions": ["createUser"],
      "imports": ["validator.js", "userModel.js"],
      "exports": ["UserService"],
      "vector": [0.1, 0.3, 0.8, ...] // 语义向量
    },
    "authService.js": {
      "functions": ["register"],
      "imports": ["userService.js"],
      "exports": ["AuthService"],
      "vector": [0.2, 0.4, 0.7, ...]
    }
  },
  "dependencies": {
    "userService.js": {
      "dependsOn": ["validator.js", "userModel.js"],
      "usedBy": ["authService.js", "userController.js"]
    }
  },
  "functions": {
    "createUser": {
      "file": "userService.js",
      "calledBy": ["authService.register", "userController.create"]
    }
  }
}
```

### 3. **Diff 出现**

假设有人修改了 `userService.js`：

```diff
// userService.js
export class UserService {
  async createUser(userData) {
+   // 新增：检查用户名长度
+   if (userData.username.length < 3) {
+     throw new Error('Username too short');
+   }
    if (!validateEmail(userData.email)) {
      throw new Error('Invalid email');
    }
    return UserModel.create(userData);
  }
}
```

### 4. **Diff 分析流程**

#### 4.1 **解析变更**
```javascript
const diffAnalysis = {
  changedFiles: ['userService.js'],
  changedFunctions: ['createUser'],
  changeType: 'logic_modification',
  addedValidation: 'username.length'
};
```

#### 4.2 **查找相关文件**
```javascript
// 从 index 中查找
const relatedFiles = [
  // 直接依赖：谁调用了 createUser？
  'authService.js',      // 因为 authService.register 调用了 createUser
  'userController.js',   // 因为 userController.create 调用了 createUser
  
  // 相关依赖：createUser 依赖什么？
  'userModel.js',        // 因为 createUser 使用了 UserModel
  'validator.js'         // 因为 createUser 使用了 validateEmail
];
```

#### 4.3 **提取相关代码片段**
```javascript
const contextSnippets = [
  // authService.js 中的相关部分
  `async register(userData) {
    return this.userService.createUser(userData); // 这里会受影响
  }`,
  
  // userController.js 中的相关部分  
  `async create(req, res) {
    const userData = req.body;
    const user = await this.userService.createUser(userData); // 这里会受影响
  }`,
  
  // userModel.js 中的相关部分
  `static create(userData) {
    // 需要确保 username 字段存在
    return new User(userData);
  }`
];
```

### 5. **构建 Code Review 上下文**

最终发送给 AI 的上下文：

```
## 变更内容
userService.js 的 createUser 方法新增了用户名长度验证

## 相关代码上下文

### 调用方 1: authService.js
```javascript
async register(userData) {
  return this.userService.createUser(userData); // 需要确保传入的 userData 有 username
}
```

### 调用方 2: userController.js  
```javascript
async create(req, res) {
  const userData = req.body;
  const user = await this.userService.createUser(userData); // 需要验证前端是否传入 username
}
```

### 数据模型: userModel.js
```javascript
static create(userData) {
  return new User(userData); // 确认 User 模型是否包含 username 字段
}
```

### 6. **AI 分析结果**

基于这个上下文，AI 能够发现：

1. **潜在问题**：新增的 `username.length` 检查可能导致 `userData.username` 为 undefined 时报错
2. **影响范围**：`authService.register` 和 `userController.create` 都需要确保传入 username
3. **建议**：
   - 添加 username 存在性检查
   - 更新相关的测试用例
   - 检查前端是否正确传递 username 字段

## 总结

整个流程就是：
1. **建立索引**：分析代码结构和依赖关系
2. **解析变更**：识别修改了什么
3. **查找相关**：从索引中找到相关的文件和函数
4. **提取片段**：只取相关的代码片段，不是整个文件
5. **构建上下文**：组装成 AI 能理解的格式进行分析
