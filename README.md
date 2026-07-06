# 校园失物招领与互助平台

<div align="center">

[![Vue 3](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**基于 Vue 3 + Node.js + MySQL 的全栈失物招领平台**

[快速开始](#快速开始) · [功能特性](#功能特性) · [API 文档](#api-文档) · [部署指南](#部署指南)

</div>

---

## 项目简介

一个专为校园场景设计的失物招领平台，帮助师生快速找回丢失物品。

### 核心特性

- **现代化技术栈**：Vue 3 Composition API + Vite + Element Plus
- **安全可靠**：JWT 认证 + bcrypt 密码加密 + 请求频率限制
- **响应式设计**：完美适配桌面端和移动端
- **生产就绪**：完善的错误处理、日志系统、安全防护

---

## 技术栈

| 模块 | 技术 |
|------|------|
| 后端 | Node.js 18.x + Express 5.2 + MySQL 8.0 |
| 前端 | Vue 3.5 + Vite 6.3 + Element Plus 2.10 |
| 认证 | JWT + bcrypt |
| 测试 | Jest 29.7 (后端) + Vitest 1.6 (前端) |

---

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd lostfound
```

### 2. 数据库设置

```bash
mysql -u root -p < database/init.sql
```

默认管理员账号：`admin` / `admin123`

### 3. 后端设置

```bash
cd server
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接和 JWT 密钥

npm run dev
```

### 4. 前端设置

```bash
cd client
npm install
npm run dev
```

### 5. 访问应用

- 前端：http://localhost:5173
- 后端 API：http://localhost:3000/api

---

## 功能特性

### 用户功能

| 功能 | 说明 |
|------|------|
| 发布失物/招领 | 支持图片上传，多条件搜索 |
| 认领机制 | 申请认领 → 等待审核 → 完成认领 |
| 消息通知 | 认领申请、审核结果实时通知 |
| 个人中心 | 管理个人信息、查看发布历史 |

### 安全特性

- JWT Token 认证（7 天过期）
- bcrypt 密码加密（10 轮）
- 请求频率限制（100 次/15 分钟，登录接口 10 次/15 分钟）
- 输入消毒（XSS 防护）
- SQL 注入防护（参数化查询）
- 文件魔数验证（防止文件类型伪装）
- 文件类型和大小限制（jpg/png/gif/webp，5MB）
- 密码学安全随机文件名

---

## 项目结构

```
lostfound/
├── client/              # 前端
│   ├── src/
│   │   ├── api/        # API 封装
│   │   ├── views/      # 页面组件
│   │   ├── components/ # 公共组件
│   │   ├── utils/      # 工具函数
│   │   └── styles/     # 全局样式
│   └── package.json
│
├── server/              # 后端
│   ├── controllers/    # 控制器
│   ├── models/         # 数据模型
│   ├── middleware/      # 中间件
│   ├── routes/         # 路由定义
│   ├── utils/          # 工具函数
│   ├── config/         # 配置文件
│   ├── __tests__/      # 后端测试
│   └── app.js          # 入口文件
│
├── database/            # 数据库脚本
│   └── init.sql
│
└── README.md
```

---

## API 文档

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/register` | 用户注册 |
| POST | `/api/login` | 用户登录 |
| GET | `/api/user/info` | 获取用户信息 |
| PUT | `/api/user/info` | 更新用户信息 |

### 失物/招领

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/lost` | 获取失物列表 |
| GET | `/api/found` | 获取招领列表 |
| POST | `/api/lost` | 发布失物信息 |
| POST | `/api/found` | 发布招领信息 |
| POST | `/api/claim/:id` | 申请认领 |

### 通知

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/notifications` | 获取通知列表 |
| GET | `/api/notifications/unread` | 获取未读通知数 |
| PUT | `/api/notifications/:id/read` | 标记通知已读 |
| DELETE | `/api/notifications/:id` | 删除通知 |

> 认证接口需要在请求头中添加 `Authorization: Bearer <token>`

---

## 部署指南

### 使用 PM2

```bash
npm install -g pm2
cd server
pm2 start app.js --name "lostfound-api"
```

### 使用 Docker

```bash
docker build -t lostfound-api ./server
docker run -d -p 3000:3000 --name lostfound-api lostfound-api
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
    }
}
```

---

## 开发指南

### 环境变量

创建 `server/.env` 文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lostfound
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

### 代码规范

- 后端：MVC 架构，中文注释
- 前端：Vue 3 Composition API
- 命名：camelCase (JS) + snake_case (SQL)

---

## 测试

```bash
# 后端测试
cd server
npm test

# 前端测试
cd client
npm test
```

---

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 联系方式

- GitHub: [SterlingLiu](https://github.com/SterlingLiu)
- Issues: [反馈问题](https://github.com/SterlingLiu/claude/issues)
