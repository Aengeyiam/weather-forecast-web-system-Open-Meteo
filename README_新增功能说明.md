# 个性化天气预报与生活建议系统（增强版）

本压缩包是在原“天气预报系统”基础上增加功能后的实训大作业版本，保留原有登录、注册、天气查询和查询历史，并新增以下功能：

1. 常用城市收藏、取消收藏、默认城市
2. 自定义天气预警：高温、低温、降雨、大风、紫外线
3. 天气趋势图表：7天最高/最低温、未来24小时温度、未来24小时降雨概率
4. 智能生活指数：穿衣、雨伞、感冒、洗车、运动、防晒
5. 个性化身份：学生、上班族、老人、户外运动者、司机
6. 天气日历 / 出行助手：按城市、日期、活动类型生成建议
7. 地图天气：点击城市点位快速查询
8. 查询历史升级：历史统计、再次查询、单条删除、清空历史
9. 登录态恢复：刷新页面后不再立即掉线

## 运行步骤

### 1. 准备环境

需要本地 PHP + MySQL 环境，例如 XAMPP、phpStudy、WampServer 或 Laragon。

### 2. 初始化数据库

进入 MySQL，执行：

```sql
source sql/init.sql;
```

或者在 phpMyAdmin 中导入 `sql/init.sql`。

### 3. 修改数据库连接

打开 `api/config.php`，按你的本地环境修改：

```php
$db_host = 'localhost';
$db_port = 3306;
$db_name = 'weather_system';
$db_user = 'root';
$db_pass = '';
```

### 4. 启动项目

把项目文件夹放到 Web 根目录，例如：

- XAMPP：`htdocs/`
- phpStudy：`WWW/`

访问：

```text
http://localhost/weather-forecast-web-system-Open-Meteo-enhanced/
```

测试账号：

```text
zhangsan / 123456
```

## 说明

- 天气数据来自 Open-Meteo 免费接口，无需 API Key。
- 天气查询需要电脑能访问互联网。
- 新增的 `api/preferences.php` 会自动创建收藏城市和用户偏好表；但推荐先导入 `sql/init.sql`，便于老师检查数据库设计。
- 图表没有使用外部库，直接用 SVG 绘制，解压后即可运行。


## 页面拆分说明

本版本已将登录界面和主界面彻底分离：

- `login.html`：独立登录页面
- `register.html`：独立注册页面
- `main.html`：独立天气主页面
- `index.html`：入口页，只负责检测登录状态并跳转
- `js/login.js`：登录页面逻辑
- `js/main.js`：天气主页面逻辑

访问项目根目录时会自动判断登录状态：已登录进入 `main.html`，未登录进入 `login.html`。
