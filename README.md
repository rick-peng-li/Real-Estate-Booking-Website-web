# Real Estate Booking Website（Homyz）

Git 地址：`git@github.com:rick-peng-li/Real-Estate-Booking-Website-web.git`

Homyz 是一个全栈房地产预订网站。用户可以浏览房源、按条件搜索、在地图上查看位置、预约看房日期、收藏喜欢的房源，也可以发布自己的房源。前端使用 React + Vite，后端使用 Express + Prisma + MongoDB，认证使用本地邮箱密码 + JWT。

## 技术架构

| 层 | 技术 |
| --- | --- |
| 前端 | React 18、Vite、React Router 6、Mantine UI、React Query、Axios、Leaflet 地图、Swiper、Framer Motion |
| 后端 | Node.js、Express、Prisma ORM、JWT（jsonwebtoken + bcryptjs 本地认证） |
| 数据库 | MongoDB（通过 Prisma 访问，本地可用 Docker 启动） |
| 认证 | 邮箱 + 密码注册登录，服务端签发 JWT，前端携带 Bearer Token 访问受保护接口 |

```
client/   React 前端（Vite）
server/   Express 后端（Prisma + MongoDB）
```

## 页面与功能

- 首页 `/`：Hero 搜索入口、合作品牌、热门房源轮播、项目价值介绍、联系方式、底部订阅
- 房源列表 `/properties`：查看全部房源，支持按标题/城市/国家关键词搜索
- 房源详情 `/properties/:propertyId`：房源信息、设施（卧室/停车/卫生间）、地图位置、预约看房（选择日期）、收藏
- 我的预约 `/bookings`：查看已预约的看房记录，可取消预约
- 我的收藏 `/favourites`：查看已收藏的房源
- 发布房源：登录后通过 Header 的 "Add Property" 弹窗填写位置、基本信息、设施并上传图片

## 接口设计

统一前缀 `/api`，需要认证的接口在 Header 携带 `Authorization: Bearer <token>`。

认证相关（`/api/auth`）：

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| POST | `/register` | 注册（body: name, email, password），返回 token 与用户信息 | 不需要 |
| POST | `/login` | 登录（body: email, password），返回 token 与用户信息 | 不需要 |

用户相关（`/api/user`）：

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| POST | `/register` | 登录后注册/同步用户 | 需要 |
| POST | `/bookVisit/:id` | 预约看房（body: email, date） | 需要 |
| POST | `/allBookings` | 获取我的预约列表 | 需要 |
| POST | `/removeBooking/:id` | 取消预约 | 需要 |
| POST | `/toFav/:rid` | 收藏/取消收藏房源 | 需要 |
| POST | `/allFav` | 获取我的收藏列表 | 需要 |

房源相关（`/api/residency`）：

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| POST | `/create` | 发布房源 | 需要 |
| GET | `/allresd` | 获取全部房源（按创建时间倒序） | 不需要 |
| GET | `/:id` | 获取单个房源详情 | 不需要 |

## 启动方式

### 1. 启动 MongoDB（Docker）

```bash
docker run -d --name homyz-mongo -p 27017:27017 mongo:7.0 --replSet rs0 --bind_ip_all
docker exec homyz-mongo mongosh --quiet --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"localhost:27017"}]})'
```

Prisma 连接 MongoDB 需要副本集模式，因此启动时必须带 `--replSet`。

### 2. 启动后端

```bash
cd server
npm install
```

在 `server/.env` 中配置：

```env
PORT=8000
DATABASE_URL="mongodb://localhost:27017/homyz?replicaSet=rs0&directConnection=true"
JWT_SECRET="homyz_jwt_secret_2026"
```

同步数据模型并导入示例数据：

```bash
npx prisma db push
npm run seed
npm start
```

后端运行在 `http://localhost:8000`。

### 3. 启动前端

```bash
cd client
npm install
npm run dev
```

前端运行在 `http://localhost:5173`。默认请求 `http://localhost:8000/api`，如需修改可在 `client/.env` 中设置 `VITE_API_BASE_URL`。

## 登录说明

项目使用本地邮箱 + 密码认证。点击页面 "Login" 弹出登录框，首次使用切换到 "Sign up" 注册即可。预约、收藏、发布房源等功能均需登录后使用。

演示账号（已通过接口注册，可直接登录）：

- 邮箱：`demo@homyz.com`
- 密码：`Homyz@2026`
