-- =====================================================
-- 个性化天气预报与生活建议系统 - 数据库初始化脚本
-- 数据库名：weather_system
-- 字符集：utf8mb4
-- 引擎：InnoDB
-- =====================================================

CREATE DATABASE IF NOT EXISTS `weather_system`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE `weather_system`;

CREATE TABLE IF NOT EXISTS `user` (
    `user_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '用户唯一ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（SHA-256加密存储）',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS `weather_history` (
    `record_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '记录唯一ID',
    `user_id` INT(11) NOT NULL COMMENT '用户ID',
    `query_city` VARCHAR(100) NOT NULL COMMENT '查询城市',
    `query_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '查询时间',
    PRIMARY KEY (`record_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_query_time` (`query_time`),
    CONSTRAINT `fk_history_user` FOREIGN KEY (`user_id`)
        REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='天气查询历史记录表';

CREATE TABLE IF NOT EXISTS `favorite_city` (
    `favorite_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
    `user_id` INT(11) NOT NULL COMMENT '用户ID',
    `city_name` VARCHAR(100) NOT NULL COMMENT '城市名称',
    `lat` DECIMAL(10,6) DEFAULT NULL COMMENT '纬度',
    `lon` DECIMAL(10,6) DEFAULT NULL COMMENT '经度',
    `is_default` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否默认城市',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`favorite_id`),
    UNIQUE KEY `uk_user_city` (`user_id`, `city_name`),
    KEY `idx_favorite_user` (`user_id`),
    CONSTRAINT `fk_favorite_user` FOREIGN KEY (`user_id`)
        REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏城市表';

CREATE TABLE IF NOT EXISTS `user_preference` (
    `user_id` INT(11) NOT NULL COMMENT '用户ID',
    `profile_type` VARCHAR(30) NOT NULL DEFAULT 'student' COMMENT '用户身份类型：student/worker/elder/outdoor/driver',
    `alerts_enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否开启预警',
    `high_temp` INT(11) NOT NULL DEFAULT 35 COMMENT '高温阈值',
    `low_temp` INT(11) NOT NULL DEFAULT 5 COMMENT '低温阈值',
    `rain_prob` INT(11) NOT NULL DEFAULT 50 COMMENT '降雨概率阈值',
    `wind_speed` INT(11) NOT NULL DEFAULT 30 COMMENT '风速阈值',
    `uv_index` INT(11) NOT NULL DEFAULT 8 COMMENT '紫外线阈值',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`user_id`),
    CONSTRAINT `fk_preference_user` FOREIGN KEY (`user_id`)
        REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户偏好与预警阈值表';

INSERT IGNORE INTO `user` (`username`, `password`) VALUES
('zhangsan', SHA2('123456', 256)),
('lisi', SHA2('password123', 256)),
('wangwu', SHA2('abc12345', 256));

INSERT IGNORE INTO `weather_history` (`record_id`, `user_id`, `query_city`) VALUES
(1, 1, '北京'), (2, 1, '上海'), (3, 2, '广州'), (4, 1, '深圳'), (5, 3, '杭州');

INSERT IGNORE INTO `favorite_city` (`favorite_id`, `user_id`, `city_name`, `lat`, `lon`, `is_default`) VALUES
(1, 1, '中国 北京 北京', 39.9075, 116.3972, 1),
(2, 1, '中国 上海 上海', 31.2222, 121.4581, 0),
(3, 1, '中国 广东 广州', 23.1167, 113.2500, 0);

INSERT IGNORE INTO `user_preference` (`user_id`, `profile_type`, `alerts_enabled`, `high_temp`, `low_temp`, `rain_prob`, `wind_speed`, `uv_index`) VALUES
(1, 'student', 1, 35, 5, 50, 30, 8),
(2, 'worker', 1, 35, 5, 50, 30, 8),
(3, 'driver', 1, 35, 5, 50, 30, 8);
