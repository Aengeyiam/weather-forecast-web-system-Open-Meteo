-- =====================================================
-- 天气预报网页系统 - 数据库初始化脚本
-- 数据库名：weather_system
-- 字符集：utf8mb4
-- 引擎：InnoDB
-- =====================================================

CREATE DATABASE IF NOT EXISTS `weather_system`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE `weather_system`;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `user_id`   INT(11)      NOT NULL AUTO_INCREMENT COMMENT '用户唯一ID',
    `username`  VARCHAR(50)  NOT NULL COMMENT '用户名',
    `password`  VARCHAR(255) NOT NULL COMMENT '密码（SHA-256加密存储）',
    `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 历史查询表
CREATE TABLE IF NOT EXISTS `weather_history` (
    `record_id`  INT(11)      NOT NULL AUTO_INCREMENT COMMENT '记录唯一ID',
    `user_id`    INT(11)      NOT NULL COMMENT '用户ID',
    `query_city` VARCHAR(100) NOT NULL COMMENT '查询城市',
    `query_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '查询时间',
    PRIMARY KEY (`record_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_query_time` (`query_time`),
    CONSTRAINT `fk_history_user` FOREIGN KEY (`user_id`)
        REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='天气查询历史记录表';

-- 预置测试用户
INSERT INTO `user` (`username`, `password`) VALUES
('zhangsan', SHA2('123456', 256)),
('lisi',     SHA2('password123', 256)),
('wangwu',   SHA2('abc12345', 256));

-- 预置测试历史记录
INSERT INTO `weather_history` (`user_id`, `query_city`) VALUES
(1, '北京'), (1, '上海'), (2, '广州'), (1, '深圳'), (3, '杭州');
