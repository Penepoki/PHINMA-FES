-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: saintjude
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
INSERT INTO `auth_group` VALUES (2,'Dean'),(4,'Professor'),(3,'Program Head'),(1,'Student');
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
INSERT INTO `auth_group_permissions` VALUES (43,1,32),(45,1,36),(42,1,48),(44,1,56),(46,2,21),(47,2,22),(48,2,23),(49,2,24),(50,2,25),(51,2,26),(52,2,27),(53,2,28),(54,2,33),(55,2,34),(56,2,35),(57,2,36),(58,2,41),(59,2,42),(60,2,43),(61,2,44),(62,2,45),(63,2,46),(64,2,47),(65,2,48),(66,2,49),(67,2,50),(68,2,52),(69,2,60),(70,2,61),(71,2,62),(72,2,63),(73,2,64),(74,2,65),(75,2,66),(76,2,67),(77,2,68),(78,2,69),(79,2,70),(80,2,71),(81,2,72),(1,3,21),(2,3,22),(3,3,23),(4,3,24),(5,3,25),(6,3,26),(7,3,27),(8,3,28),(9,3,29),(10,3,30),(11,3,31),(12,3,32),(13,3,33),(14,3,34),(15,3,35),(16,3,36),(17,3,40),(18,3,41),(19,3,42),(20,3,43),(21,3,44),(22,3,45),(23,3,46),(24,3,47),(25,3,48),(26,3,49),(27,3,50),(28,3,51),(29,3,52),(30,3,56),(31,3,60),(39,4,24),(41,4,28),(32,4,32),(33,4,36),(34,4,40),(35,4,44),(37,4,48),(38,4,52),(40,4,56),(36,4,60);
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add permission',1,'add_permission'),(2,'Can change permission',1,'change_permission'),(3,'Can delete permission',1,'delete_permission'),(4,'Can view permission',1,'view_permission'),(5,'Can add group',2,'add_group'),(6,'Can change group',2,'change_group'),(7,'Can delete group',2,'delete_group'),(8,'Can view group',2,'view_group'),(9,'Can add content type',3,'add_contenttype'),(10,'Can change content type',3,'change_contenttype'),(11,'Can delete content type',3,'delete_contenttype'),(12,'Can view content type',3,'view_contenttype'),(13,'Can add session',4,'add_session'),(14,'Can change session',4,'change_session'),(15,'Can delete session',4,'delete_session'),(16,'Can view session',4,'view_session'),(17,'Can add log entry',5,'add_logentry'),(18,'Can change log entry',5,'change_logentry'),(19,'Can delete log entry',5,'delete_logentry'),(20,'Can view log entry',5,'view_logentry'),(21,'Can add course',6,'add_course'),(22,'Can change course',6,'change_course'),(23,'Can delete course',6,'delete_course'),(24,'Can view course',6,'view_course'),(25,'Can add room',7,'add_room'),(26,'Can change room',7,'change_room'),(27,'Can delete room',7,'delete_room'),(28,'Can view room',7,'view_room'),(29,'Can add student evaluation',8,'add_studentevaluation'),(30,'Can change student evaluation',8,'change_studentevaluation'),(31,'Can delete student evaluation',8,'delete_studentevaluation'),(32,'Can view student evaluation',8,'view_studentevaluation'),(33,'Can add subject',9,'add_subject'),(34,'Can change subject',9,'change_subject'),(35,'Can delete subject',9,'delete_subject'),(36,'Can view subject',9,'view_subject'),(37,'Can add user',10,'add_user'),(38,'Can change user',10,'change_user'),(39,'Can delete user',10,'delete_user'),(40,'Can view user',10,'view_user'),(41,'Can add schedule',11,'add_schedule'),(42,'Can change schedule',11,'change_schedule'),(43,'Can delete schedule',11,'delete_schedule'),(44,'Can view schedule',11,'view_schedule'),(45,'Can add faculty assignment',12,'add_facultyassignment'),(46,'Can change faculty assignment',12,'change_facultyassignment'),(47,'Can delete faculty assignment',12,'delete_facultyassignment'),(48,'Can view faculty assignment',12,'view_facultyassignment'),(49,'Can add evaluation',13,'add_evaluation'),(50,'Can change evaluation',13,'change_evaluation'),(51,'Can delete evaluation',13,'delete_evaluation'),(52,'Can view evaluation',13,'view_evaluation'),(53,'Can add student evaluation question',14,'add_studentevaluationquestion'),(54,'Can change student evaluation question',14,'change_studentevaluationquestion'),(55,'Can delete student evaluation question',14,'delete_studentevaluationquestion'),(56,'Can view student evaluation question',14,'view_studentevaluationquestion'),(57,'Can add student evaluation response',15,'add_studentevaluationresponse'),(58,'Can change student evaluation response',15,'change_studentevaluationresponse'),(59,'Can delete student evaluation response',15,'delete_studentevaluationresponse'),(60,'Can view student evaluation response',15,'view_studentevaluationresponse'),(61,'Can add course professor',16,'add_courseprofessor'),(62,'Can change course professor',16,'change_courseprofessor'),(63,'Can delete course professor',16,'delete_courseprofessor'),(64,'Can view course professor',16,'view_courseprofessor'),(65,'Can add faculty schedule',17,'add_facultyschedule'),(66,'Can change faculty schedule',17,'change_facultyschedule'),(67,'Can delete faculty schedule',17,'delete_facultyschedule'),(68,'Can view faculty schedule',17,'view_facultyschedule'),(69,'Can add section',18,'add_section'),(70,'Can change section',18,'change_section'),(71,'Can delete section',18,'delete_section'),(72,'Can view section',18,'view_section'),(73,'Can add Token',19,'add_token'),(74,'Can change Token',19,'change_token'),(75,'Can delete Token',19,'delete_token'),(76,'Can view Token',19,'view_token'),(77,'Can add Token',20,'add_tokenproxy'),(78,'Can change Token',20,'change_tokenproxy'),(79,'Can delete Token',20,'delete_tokenproxy'),(80,'Can view Token',20,'view_tokenproxy'),(81,'Can add evaluation evaluator',21,'add_evaluationevaluator'),(82,'Can change evaluation evaluator',21,'change_evaluationevaluator'),(83,'Can delete evaluation evaluator',21,'delete_evaluationevaluator'),(84,'Can view evaluation evaluator',21,'view_evaluationevaluator'),(85,'Can add evaluation instructor',22,'add_evaluationinstructor'),(86,'Can change evaluation instructor',22,'change_evaluationinstructor'),(87,'Can delete evaluation instructor',22,'delete_evaluationinstructor'),(88,'Can view evaluation instructor',22,'view_evaluationinstructor');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authtoken_token`
--

DROP TABLE IF EXISTS `authtoken_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authtoken_token` (
  `key` varchar(40) NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`key`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `authtoken_token_user_id_35299eff_fk_hrapp_user_id` FOREIGN KEY (`user_id`) REFERENCES `hrapp_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authtoken_token`
--

LOCK TABLES `authtoken_token` WRITE;
/*!40000 ALTER TABLE `authtoken_token` DISABLE KEYS */;
INSERT INTO `authtoken_token` VALUES ('0927c69f3bb09dc25242c375de3717c252231709','2025-04-07 06:55:49.739436',6),('a12cbbae556f980033a90a25f00d9eb5207903a5','2025-04-08 03:35:24.965722',4),('a3dcdb46a2b13ff8d3397558fd06bbea5c7880de','2025-04-23 06:53:54.122996',9),('c07aa27725a4f48509967b2aea487699e952e2a5','2025-04-23 04:58:26.626590',1);
/*!40000 ALTER TABLE `authtoken_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_hrapp_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_hrapp_user_id` FOREIGN KEY (`user_id`) REFERENCES `hrapp_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
INSERT INTO `django_admin_log` VALUES (1,'2025-04-03 04:55:44.395285','2','alimjazel14@gmail.com',1,'[{\"added\": {}}]',10,1),(2,'2025-04-03 04:56:57.364440','1','BSIT - Bachelors of Science in Information Technology - BSIT - BSIT - True - 2025-04-03 04:56:57.363440+00:00 - 2025-04-03 04:56:57.363440+00:00 - None',1,'[{\"added\": {}}]',6,1),(3,'2025-04-03 04:57:27.533442','1','Comlab - 1 - CL-1 - False - 2025-04-03 04:57:27.533442+00:00 - 2025-04-03 04:57:27.533442+00:00 - None',1,'[{\"added\": {}}]',7,1),(4,'2025-04-03 04:57:34.670674','1','Comlab - 1 - CL-1 - True - 2025-04-03 04:57:27.533442+00:00 - 2025-04-03 04:57:34.670674+00:00 - None',2,'[{\"changed\": {\"fields\": [\"Is active\"]}}]',7,1),(5,'2025-04-03 05:00:55.675094','1','Networking II - NET-2 - True - 2025-04-03 05:00:55.675094+00:00 - 2025-04-03 05:00:55.675094+00:00 - None',1,'[{\"added\": {}}]',9,1),(6,'2025-04-03 06:09:19.181812','2','Dean',1,'[{\"added\": {}}]',2,1),(7,'2025-04-03 06:09:28.251837','3','Program Head',1,'[{\"added\": {}}]',2,1),(8,'2025-04-03 06:12:24.597056','3','Program Head',2,'[{\"changed\": {\"fields\": [\"Permissions\"]}}]',2,1),(9,'2025-04-03 06:16:11.274030','1','Comlab - 1 - CL-1 - True - 2025-04-03 04:57:27.533442+00:00 - 2025-04-03 04:57:34.670674+00:00 - None',3,'',7,1),(10,'2025-04-03 06:16:17.353446','1','Networking II - NET-2 - True - 2025-04-03 05:00:55.675094+00:00 - 2025-04-03 05:00:55.675094+00:00 - None',3,'',9,1),(11,'2025-04-03 06:33:07.590259','3','rjdaw.sjc@phinmaed.com',1,'[{\"added\": {}}]',10,1),(12,'2025-04-03 06:34:20.671778','4','Professor',1,'[{\"added\": {}}]',2,1),(13,'2025-04-03 07:32:41.771835','4','romdeo.sjc@phinmaed.com',1,'[{\"added\": {}}]',10,1),(14,'2025-04-03 07:32:52.379773','4','romdeo.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(15,'2025-04-03 07:33:02.562233','3','rjdaw.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Supervisor\"]}}]',10,1),(16,'2025-04-03 07:43:46.981228','1','SFF - For Networking - SFF FEEDBACK STUDENT - 2025-04-03 07:43:46.975185+00:00 - 2025-04-03 07:43:46.975185+00:00 - None',1,'[{\"added\": {}}]',8,1),(17,'2025-04-03 07:44:15.668769','1','WHAT IS YOUR COMMENT TO THIS PROF - TEXT - 2025-04-03 07:44:15.668769+00:00 - 2025-04-03 07:44:15.668769+00:00 - None',1,'[{\"added\": {}}]',14,1),(18,'2025-04-03 07:44:32.322432','2','RATE THIS PROF FROM 1 - 10 - RATING - 2025-04-03 07:44:32.321433+00:00 - 2025-04-03 07:44:32.321433+00:00 - None',1,'[{\"added\": {}}]',14,1),(19,'2025-04-03 07:45:04.758723','3','WAS THIS PROF HELPFUL TO YOUR STUDY JOURNEY - MCQ - 2025-04-03 07:45:04.754218+00:00 - 2025-04-03 07:45:04.754218+00:00 - None',1,'[{\"added\": {}}]',14,1),(20,'2025-04-03 07:45:49.175878','1','SFF - For Networking - SFF FEEDBACK STUDENT - 2025-04-03 07:43:46.975185+00:00 - 2025-04-03 07:45:49.172188+00:00 - None',2,'[{\"changed\": {\"fields\": [\"User professor\", \"Import questions\"]}}]',8,1),(21,'2025-04-03 07:46:32.905056','2','SFF FOR JAZEL ALIM - SFF FOR JAZEL ALIM - 2025-04-03 07:46:32.900374+00:00 - 2025-04-03 07:46:32.900374+00:00 - None',1,'[{\"added\": {}}]',8,1),(22,'2025-04-03 07:52:51.521267','3','BSIT - Bachelors of Science in Information Technology - BSIT - BSIT - True - 2025-04-03 07:52:51.521267+00:00 - 2025-04-03 07:52:51.521267+00:00 - None',1,'[{\"added\": {}}, {\"added\": {\"name\": \"course professor\", \"object\": \"rjdaw.sjc@phinmaed.com - BSIT - Bachelors of Science in Information Technology - BSIT - BSIT - True - 2025-04-03 07:52:51.521267+00:00 - 2025-04-03 07:52:51.521267+00:00 - None - 2025-04-03 07:52:51.521267+00:00\"}}]',6,1),(23,'2025-04-03 07:53:05.182559','2','Comlab - 1 - CL-1 - True - 2025-04-03 07:53:05.181559+00:00 - 2025-04-03 07:53:05.181559+00:00 - None',1,'[{\"added\": {}}]',7,1),(24,'2025-04-03 07:53:18.514301','2','Networking II - NET-2 - True - 2025-04-03 07:53:18.514301+00:00 - 2025-04-03 07:53:18.514301+00:00 - None',1,'[{\"added\": {}}]',9,1),(25,'2025-04-04 02:34:52.945496','3','BSIT - Bachelors of Science in Information Technology - BSIT - BSIT - True - 2025-04-03 07:52:51.521267+00:00 - 2025-04-04 02:34:52.942435+00:00 - None',2,'[{\"added\": {\"name\": \"course professor\", \"object\": \"alimjazel14@gmail.com - BSIT - Bachelors of Science in Information Technology - BSIT - BSIT - True - 2025-04-03 07:52:51.521267+00:00 - 2025-04-04 02:34:52.942435+00:00 - None - 2025-04-04 02:34:52.943861+00:00\"}}]',6,1),(26,'2025-04-04 05:09:08.309790','1','First Year - BSIT - Bachelors of Science in Information Technology',1,'[{\"added\": {}}]',18,1),(27,'2025-04-04 05:10:07.779320','5','chor.sjc@phinmaed.com',1,'[{\"added\": {}}]',10,1),(28,'2025-04-04 05:11:16.503095','1','Student',2,'[{\"changed\": {\"fields\": [\"Permissions\"]}}]',2,1),(29,'2025-04-04 05:12:12.576081','6','rencua.sjc@phinmaed.com',1,'[{\"added\": {}}]',10,1),(30,'2025-04-04 05:13:19.128478','1','First Year - BSIT - Bachelors of Science in Information Technology',2,'[{\"changed\": {\"fields\": [\"Students\"]}}]',18,1),(31,'2025-04-04 05:13:47.030670','1','Section 1 - BSIT - Bachelors of Science in Information Technology',2,'[{\"changed\": {\"fields\": [\"Name\"]}}]',18,1),(32,'2025-04-04 05:13:59.392806','2','Section 2 - BSIT - Bachelors of Science in Information Technology',1,'[{\"added\": {}}]',18,1),(33,'2025-04-04 05:15:47.622440','7','HazelDulay@phinmaed.com',1,'[{\"added\": {}}]',10,1),(34,'2025-04-04 05:18:43.462322','7','HazelDulay@phinmaed.com',2,'[]',10,1),(35,'2025-04-04 05:19:43.344903','8','JuDayat.sjc@phinmaed.com',1,'[{\"added\": {}}]',10,1),(36,'2025-04-04 05:19:52.923757','8','JuDayat.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(37,'2025-04-04 05:20:04.349722','7','HazelDulay@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(38,'2025-04-04 05:20:25.845612','1','espinedamartin14@yahoo.com',2,'[{\"changed\": {\"fields\": [\"First name\"]}}]',10,1),(39,'2025-04-04 05:21:00.591703','3','Panitikang Filipino - FIL-127 - True - 2025-04-04 05:21:00.591703+00:00 - 2025-04-04 05:21:00.591703+00:00 - None',1,'[{\"added\": {}}]',9,1),(40,'2025-04-04 05:21:33.561765','3','BSIT - Bachelors of Science in Information Technology - BSIT - BSIT - True - 2025-04-03 07:52:51.521267+00:00 - 2025-04-04 05:21:33.561765+00:00 - None',2,'[{\"added\": {\"name\": \"course professor\", \"object\": \"romdeo.sjc@phinmaed.com - BSIT - Bachelors of Science in Information Technology - BSIT - BSIT - True - 2025-04-03 07:52:51.521267+00:00 - 2025-04-04 05:21:33.561765+00:00 - None - 2025-04-04 05:21:33.561765+00:00\"}}]',6,1),(41,'2025-04-04 05:22:04.378388','4','CAAS - College of Arts and Sciences - CAAS - CAAS - True - 2025-04-04 05:22:04.378388+00:00 - 2025-04-04 05:22:04.378388+00:00 - None',1,'[{\"added\": {}}, {\"added\": {\"name\": \"course professor\", \"object\": \"JuDayat.sjc@phinmaed.com - CAAS - College of Arts and Sciences - CAAS - CAAS - True - 2025-04-04 05:22:04.378388+00:00 - 2025-04-04 05:22:04.378388+00:00 - None - 2025-04-04 05:22:04.378388+00:00\"}}, {\"added\": {\"name\": \"course professor\", \"object\": \"HazelDulay@phinmaed.com - CAAS - College of Arts and Sciences - CAAS - CAAS - True - 2025-04-04 05:22:04.378388+00:00 - 2025-04-04 05:22:04.378388+00:00 - None - 2025-04-04 05:22:04.378388+00:00\"}}]',6,1),(42,'2025-04-04 05:22:42.777660','3','D-204 - D-204 - True - 2025-04-04 05:22:42.777660+00:00 - 2025-04-04 05:22:42.777660+00:00 - None',1,'[{\"added\": {}}]',7,1),(43,'2025-04-04 05:27:04.090517','7','HazelDulay@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Supervisor\"]}}]',10,1),(44,'2025-04-04 05:27:10.594457','3','rjdaw.sjc@phinmaed.com',2,'[]',10,1),(45,'2025-04-04 07:26:38.288457','2','Section 2 - BSIT - Bachelors of Science in Information Technology',2,'[{\"changed\": {\"fields\": [\"Year level\"]}}]',18,1),(46,'2025-04-04 07:26:42.530644','1','Section 1 - BSIT - Bachelors of Science in Information Technology',2,'[{\"changed\": {\"fields\": [\"Year level\"]}}]',18,1),(47,'2025-04-04 07:51:01.416933','1','  Year 1 - Section 1  - BSIT - Bachelors of Science in Information Technology  - Networking II - NET-2 - True - 2025-04-03 07:53:18.514301+00:00 - 2025-04-03 07:53:18.514301+00:00 - None - Comlab - 1 ',1,'[{\"added\": {}}]',11,1),(48,'2025-04-07 02:20:15.528863','1','  Year 1 - Section 1  - BSIT - Bachelors of Science in Information Technology  - Networking II - NET-2 - True  - Comlab - 1 - CL-1 - True - BSIT 1-1 NET - 12:00:00 - 13:30:00 - First - 2024-2025 - Tru',2,'[{\"changed\": {\"fields\": [\"Name\"]}}]',11,1),(49,'2025-04-07 02:37:00.608533','8','JuDayat.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(50,'2025-04-07 02:37:12.297698','3','rjdaw.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(51,'2025-04-07 02:56:19.528318','1','romdeo.sjc@phinmaed.com',1,'[{\"added\": {}}, {\"added\": {\"name\": \"faculty schedule\", \"object\": \"romdeo.sjc@phinmaed.com -> BSIT 1-1 NET at 2025-04-07 02:56:19.528318+00:00\"}}]',12,1),(52,'2025-04-07 08:24:47.517888','2','chor.sjc@phinmaed.com',1,'[{\"added\": {}}]',12,1),(53,'2025-04-07 08:28:15.264173','2','chor.sjc@phinmaed.com',2,'[{\"added\": {\"name\": \"faculty schedule\", \"object\": \"chor.sjc@phinmaed.com -> BSIT 1-1 NET at 2025-04-07 08:28:15.263095+00:00\"}}, {\"added\": {\"name\": \"faculty schedule\", \"object\": \"chor.sjc@phinmaed.com -> BSIT 1-1 NET at 2025-04-07 08:28:15.264173+00:00\"}}]',12,1),(54,'2025-04-08 02:36:07.427193','4','romdeo.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',10,1),(55,'2025-04-08 02:57:00.304812','4','romdeo.sjc@phinmaed.com',2,'[]',10,1),(56,'2025-04-08 03:18:36.434110','2','Dean',2,'[{\"changed\": {\"fields\": [\"Permissions\"]}}]',2,1),(57,'2025-04-08 03:34:29.205098','4','romdeo.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',10,1),(58,'2025-04-08 03:34:34.709369','4','romdeo.sjc@phinmaed.com',2,'[]',10,1),(59,'2025-04-08 03:35:06.553486','4','romdeo.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Username\"]}}]',10,1),(60,'2025-04-23 07:42:21.927567','11','319bf668356de85f2e3ab6e53f75330ee51c023a',3,'',20,1),(61,'2025-04-23 07:42:25.953754','12','758941880a64b3bf59cb617a7f426e8473564c83',3,'',20,1),(62,'2025-04-23 07:42:29.139842','13','e4979d4f894759c0fe552c1cf43c6b74de9ccd29',3,'',20,1),(63,'2025-04-23 07:42:34.005133','14','1d8d7e490d289457b644afa53585b8338585d596',3,'',20,1),(64,'2025-04-23 07:42:52.196711','13','sample.4sjc@phinmaed.com',3,'',10,1),(65,'2025-04-23 07:42:58.930144','10','sample.sjc@phinmaed.com',3,'',10,1),(66,'2025-04-23 07:43:03.143696','15','sample6.sjc@phinmaed.com',3,'',10,1),(67,'2025-04-23 07:43:06.093284','14','sample5.sjc@phinmaed.com',3,'',10,1),(68,'2025-04-23 07:43:10.181458','11','sample.2sjc@phinmaed.com',3,'',10,1),(69,'2025-04-23 07:43:13.040825','12','sample.3sjc@phinmaed.com',3,'',10,1);
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (5,'admin','logentry'),(2,'auth','group'),(1,'auth','permission'),(19,'authtoken','token'),(20,'authtoken','tokenproxy'),(3,'contenttypes','contenttype'),(6,'hrapp','course'),(16,'hrapp','courseprofessor'),(13,'hrapp','evaluation'),(21,'hrapp','evaluationevaluator'),(22,'hrapp','evaluationinstructor'),(12,'hrapp','facultyassignment'),(17,'hrapp','facultyschedule'),(7,'hrapp','room'),(11,'hrapp','schedule'),(18,'hrapp','section'),(8,'hrapp','studentevaluation'),(14,'hrapp','studentevaluationquestion'),(15,'hrapp','studentevaluationresponse'),(9,'hrapp','subject'),(10,'hrapp','user'),(4,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-04-03 04:26:38.301924'),(2,'contenttypes','0002_remove_content_type_name','2025-04-03 04:26:38.364800'),(3,'auth','0001_initial','2025-04-03 04:26:38.537030'),(4,'auth','0002_alter_permission_name_max_length','2025-04-03 04:26:38.568664'),(5,'auth','0003_alter_user_email_max_length','2025-04-03 04:26:38.568664'),(6,'auth','0004_alter_user_username_opts','2025-04-03 04:26:38.584287'),(7,'auth','0005_alter_user_last_login_null','2025-04-03 04:26:38.584287'),(8,'auth','0006_require_contenttypes_0002','2025-04-03 04:26:38.584287'),(9,'auth','0007_alter_validators_add_error_messages','2025-04-03 04:26:38.584287'),(10,'auth','0008_alter_user_username_max_length','2025-04-03 04:26:38.584287'),(11,'auth','0009_alter_user_last_name_max_length','2025-04-03 04:26:38.599908'),(12,'auth','0010_alter_group_name_max_length','2025-04-03 04:26:38.599908'),(13,'auth','0011_update_proxy_permissions','2025-04-03 04:26:38.615530'),(14,'auth','0012_alter_user_first_name_max_length','2025-04-03 04:26:38.615530'),(15,'hrapp','0001_initial','2025-04-03 04:26:39.650488'),(16,'admin','0001_initial','2025-04-03 04:26:39.744609'),(17,'admin','0002_logentry_remove_auto_add','2025-04-03 04:26:39.754116'),(18,'admin','0003_logentry_add_action_flag_choices','2025-04-03 04:26:39.760620'),(19,'hrapp','0002_alter_user_managers','2025-04-03 04:26:39.776244'),(20,'hrapp','0003_customstudentevaluationresponse_and_more','2025-04-03 04:26:39.963978'),(21,'hrapp','0004_delete_customstudentevaluationresponse_and_more','2025-04-03 04:26:39.979603'),(22,'hrapp','0005_remove_user_role_delete_role','2025-04-03 04:26:40.108139'),(23,'hrapp','0006_user_is_deleted','2025-04-03 04:26:40.186134'),(24,'hrapp','0007_alter_user_options_studentevaluation_user_professor_and_more','2025-04-03 04:26:41.362488'),(25,'hrapp','0008_studentevaluation_import_questions_and_more','2025-04-03 04:26:41.487852'),(26,'hrapp','0009_alter_facultyassignment_schedule_and_more','2025-04-03 04:26:41.660468'),(27,'sessions','0001_initial','2025-04-03 04:26:41.676092'),(28,'hrapp','0010_remove_schedule_course_remove_schedule_professor_and_more','2025-04-03 07:52:06.277796'),(29,'hrapp','0011_remove_facultyassignment_schedule_schedule_course_and_more','2025-04-04 05:07:50.912865'),(30,'hrapp','0012_section_year_level','2025-04-04 07:26:04.815344'),(31,'authtoken','0001_initial','2025-04-07 06:18:26.955871'),(32,'authtoken','0002_auto_20160226_1747','2025-04-07 06:18:27.003130'),(33,'authtoken','0003_tokenproxy','2025-04-07 06:18:27.003130'),(34,'authtoken','0004_alter_tokenproxy_options','2025-04-07 06:18:27.003130'),(35,'hrapp','0013_alter_schedule_name','2025-04-07 06:51:09.364127'),(36,'hrapp','0014_remove_evaluation_evaluator_and_more','2025-04-08 07:01:15.572703'),(37,'hrapp','0015_alter_evaluation_schedule','2025-04-08 07:01:15.698071'),(38,'hrapp','0016_evaluation_is_deleted','2025-04-22 07:22:27.707809');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('w3ydgktcn8600h0icnvu1ammynxvtfs7','.eJxVjDsOwyAQRO9CHaEF802Z3mdAC4uDkwgkY1dR7h5bcpFUI817M28WcFtL2HpewkzsygS7_HYR0zPXA9AD673x1Oq6zJEfCj9p52Oj_Lqd7t9BwV72NVgQRiZnFAKRVzHagcQgSPoM3iQUdk9ltdRakfHgJu-8lQB5kgMq9vkCti02hQ:1u7Tys:WlrFDG0xQx5GBk3HL9fdDMyfU6FvLDtbLhk987QJ2KY','2025-05-07 06:53:14.057876'),('xn7l3ir9yr2srw4u8hb8xqsxd2mt1vzw','.eJxVjEEOwiAQAP_C2ZDCAi4evfsGssAiVUOT0p6MfzckPeh1ZjJvEWjfatg7r2HO4iKUOP2ySOnJbYj8oHZfZFrats5RjkQetsvbkvl1Pdq_QaVexxaT0daAQ6ujV8549N4bXdhpAqvVGRViAmujnRQpLgglU_SJAWHS4vMFmBs2ZQ:1u1zjJ:gfEFxPz2i1uZPWK7lgIdDbR6xYfDP-vEQL7GksmaBgo','2025-04-22 03:34:29.205098');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_course`
--

DROP TABLE IF EXISTS `hrapp_course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_course` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_course`
--

LOCK TABLES `hrapp_course` WRITE;
/*!40000 ALTER TABLE `hrapp_course` DISABLE KEYS */;
INSERT INTO `hrapp_course` VALUES (3,'BSIT - Bachelors of Science in Information Technology','BSIT','BSIT',1,NULL,'2025-04-03 07:52:51.521267','2025-04-04 05:21:33.561765'),(4,'CAAS - College of Arts and Sciences','CAAS','CAAS',1,NULL,'2025-04-04 05:22:04.378388','2025-04-04 05:22:04.378388');
/*!40000 ALTER TABLE `hrapp_course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_courseprofessor`
--

DROP TABLE IF EXISTS `hrapp_courseprofessor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_courseprofessor` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assigned_at` datetime(6) NOT NULL,
  `course_id` bigint NOT NULL,
  `professor_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `hrapp_courseprofessor_course_id_2808bfd2_fk_hrapp_course_id` (`course_id`),
  KEY `hrapp_courseprofessor_professor_id_2aa3a58b_fk_hrapp_user_id` (`professor_id`),
  CONSTRAINT `hrapp_courseprofessor_course_id_2808bfd2_fk_hrapp_course_id` FOREIGN KEY (`course_id`) REFERENCES `hrapp_course` (`id`),
  CONSTRAINT `hrapp_courseprofessor_professor_id_2aa3a58b_fk_hrapp_user_id` FOREIGN KEY (`professor_id`) REFERENCES `hrapp_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_courseprofessor`
--

LOCK TABLES `hrapp_courseprofessor` WRITE;
/*!40000 ALTER TABLE `hrapp_courseprofessor` DISABLE KEYS */;
INSERT INTO `hrapp_courseprofessor` VALUES (1,'2025-04-03 07:52:51.521267',3,3),(2,'2025-04-04 02:34:52.943861',3,2),(3,'2025-04-04 05:21:33.561765',3,4),(4,'2025-04-04 05:22:04.378388',4,8),(5,'2025-04-04 05:22:04.378388',4,7);
/*!40000 ALTER TABLE `hrapp_courseprofessor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_evaluation`
--

DROP TABLE IF EXISTS `hrapp_evaluation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_evaluation` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `observation_date` date NOT NULL,
  `evaluation_type` varchar(100) NOT NULL,
  `additional_comments` longtext,
  `instructor_comments` json DEFAULT NULL,
  `student_comments` json DEFAULT NULL,
  `student_activities` json DEFAULT NULL,
  `instructor_activities` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `schedule_id` bigint DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `hrapp_evaluation_schedule_id_21fc731b_fk_hrapp_schedule_id` (`schedule_id`),
  CONSTRAINT `hrapp_evaluation_schedule_id_21fc731b_fk_hrapp_schedule_id` FOREIGN KEY (`schedule_id`) REFERENCES `hrapp_schedule` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_evaluation`
--

LOCK TABLES `hrapp_evaluation` WRITE;
/*!40000 ALTER TABLE `hrapp_evaluation` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrapp_evaluation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_evaluationevaluator`
--

DROP TABLE IF EXISTS `hrapp_evaluationevaluator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_evaluationevaluator` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `evaluation_id` bigint NOT NULL,
  `evaluator_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `hrapp_evaluationeval_evaluation_id_41d95f44_fk_hrapp_eva` (`evaluation_id`),
  KEY `hrapp_evaluationevaluator_evaluator_id_7a7248bf_fk_hrapp_user_id` (`evaluator_id`),
  CONSTRAINT `hrapp_evaluationeval_evaluation_id_41d95f44_fk_hrapp_eva` FOREIGN KEY (`evaluation_id`) REFERENCES `hrapp_evaluation` (`id`),
  CONSTRAINT `hrapp_evaluationevaluator_evaluator_id_7a7248bf_fk_hrapp_user_id` FOREIGN KEY (`evaluator_id`) REFERENCES `hrapp_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_evaluationevaluator`
--

LOCK TABLES `hrapp_evaluationevaluator` WRITE;
/*!40000 ALTER TABLE `hrapp_evaluationevaluator` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrapp_evaluationevaluator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_evaluationinstructor`
--

DROP TABLE IF EXISTS `hrapp_evaluationinstructor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_evaluationinstructor` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `evaluation_id` bigint NOT NULL,
  `instructor_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `hrapp_evaluationinst_evaluation_id_b2853602_fk_hrapp_eva` (`evaluation_id`),
  KEY `hrapp_evaluationinst_instructor_id_3a176fb5_fk_hrapp_use` (`instructor_id`),
  CONSTRAINT `hrapp_evaluationinst_evaluation_id_b2853602_fk_hrapp_eva` FOREIGN KEY (`evaluation_id`) REFERENCES `hrapp_evaluation` (`id`),
  CONSTRAINT `hrapp_evaluationinst_instructor_id_3a176fb5_fk_hrapp_use` FOREIGN KEY (`instructor_id`) REFERENCES `hrapp_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_evaluationinstructor`
--

LOCK TABLES `hrapp_evaluationinstructor` WRITE;
/*!40000 ALTER TABLE `hrapp_evaluationinstructor` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrapp_evaluationinstructor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_facultyassignment`
--

DROP TABLE IF EXISTS `hrapp_facultyassignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_facultyassignment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hrapp_facultyassignment_user_id_6cc405ad_fk_hrapp_user_id` (`user_id`),
  CONSTRAINT `hrapp_facultyassignment_user_id_6cc405ad_fk_hrapp_user_id` FOREIGN KEY (`user_id`) REFERENCES `hrapp_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_facultyassignment`
--

LOCK TABLES `hrapp_facultyassignment` WRITE;
/*!40000 ALTER TABLE `hrapp_facultyassignment` DISABLE KEYS */;
INSERT INTO `hrapp_facultyassignment` VALUES (1,'2025-04-07 02:56:19.519734','2025-04-07 02:56:19.519734',4,NULL),(2,'2025-04-07 08:24:47.515140','2025-04-07 08:28:15.261440',5,NULL);
/*!40000 ALTER TABLE `hrapp_facultyassignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_facultyschedule`
--

DROP TABLE IF EXISTS `hrapp_facultyschedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_facultyschedule` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assigned_at` datetime(6) NOT NULL,
  `faculty_assignment_id` bigint NOT NULL,
  `schedule_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `hrapp_facultyschedul_faculty_assignment_i_36301d50_fk_hrapp_fac` (`faculty_assignment_id`),
  KEY `hrapp_facultyschedule_schedule_id_3e406040_fk_hrapp_schedule_id` (`schedule_id`),
  CONSTRAINT `hrapp_facultyschedul_faculty_assignment_i_36301d50_fk_hrapp_fac` FOREIGN KEY (`faculty_assignment_id`) REFERENCES `hrapp_facultyassignment` (`id`),
  CONSTRAINT `hrapp_facultyschedule_schedule_id_3e406040_fk_hrapp_schedule_id` FOREIGN KEY (`schedule_id`) REFERENCES `hrapp_schedule` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_facultyschedule`
--

LOCK TABLES `hrapp_facultyschedule` WRITE;
/*!40000 ALTER TABLE `hrapp_facultyschedule` DISABLE KEYS */;
INSERT INTO `hrapp_facultyschedule` VALUES (1,'2025-04-07 02:56:19.528318',1,1),(2,'2025-04-07 08:28:15.263095',2,1),(3,'2025-04-07 08:28:15.264173',2,1);
/*!40000 ALTER TABLE `hrapp_facultyschedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_room`
--

DROP TABLE IF EXISTS `hrapp_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_room` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_room`
--

LOCK TABLES `hrapp_room` WRITE;
/*!40000 ALTER TABLE `hrapp_room` DISABLE KEYS */;
INSERT INTO `hrapp_room` VALUES (2,'Comlab - 1','CL-1',1,NULL,'2025-04-03 07:53:05.181559','2025-04-03 07:53:05.181559'),(3,'D-204','D-204',1,NULL,'2025-04-04 05:22:42.777660','2025-04-04 05:22:42.777660');
/*!40000 ALTER TABLE `hrapp_room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_schedule`
--

DROP TABLE IF EXISTS `hrapp_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_schedule` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `start_time` time(6) NOT NULL,
  `end_time` time(6) NOT NULL,
  `semester` varchar(10) NOT NULL,
  `year` varchar(10) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `room_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  `course_id` bigint DEFAULT NULL,
  `section_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hrapp_schedule_room_id_be7e1ea8_fk_hrapp_room_id` (`room_id`),
  KEY `hrapp_schedule_subject_id_a91e0e64_fk_hrapp_subject_id` (`subject_id`),
  KEY `hrapp_schedule_course_id_a16f1e56_fk_hrapp_course_id` (`course_id`),
  KEY `hrapp_schedule_section_id_791d642a_fk_hrapp_section_id` (`section_id`),
  CONSTRAINT `hrapp_schedule_course_id_a16f1e56_fk_hrapp_course_id` FOREIGN KEY (`course_id`) REFERENCES `hrapp_course` (`id`),
  CONSTRAINT `hrapp_schedule_room_id_be7e1ea8_fk_hrapp_room_id` FOREIGN KEY (`room_id`) REFERENCES `hrapp_room` (`id`),
  CONSTRAINT `hrapp_schedule_section_id_791d642a_fk_hrapp_section_id` FOREIGN KEY (`section_id`) REFERENCES `hrapp_section` (`id`),
  CONSTRAINT `hrapp_schedule_subject_id_a91e0e64_fk_hrapp_subject_id` FOREIGN KEY (`subject_id`) REFERENCES `hrapp_subject` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_schedule`
--

LOCK TABLES `hrapp_schedule` WRITE;
/*!40000 ALTER TABLE `hrapp_schedule` DISABLE KEYS */;
INSERT INTO `hrapp_schedule` VALUES (1,'BSIT 1-1 NET','12:00:00.000000','13:30:00.000000','First','2024-2025',1,NULL,'2025-04-04 07:51:01.409668','2025-04-07 02:20:15.520758',2,2,3,1);
/*!40000 ALTER TABLE `hrapp_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_section`
--

DROP TABLE IF EXISTS `hrapp_section`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_section` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `course_id` bigint NOT NULL,
  `year_level` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `hrapp_section_course_id_2c76777d_fk_hrapp_course_id` (`course_id`),
  CONSTRAINT `hrapp_section_course_id_2c76777d_fk_hrapp_course_id` FOREIGN KEY (`course_id`) REFERENCES `hrapp_course` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_section`
--

LOCK TABLES `hrapp_section` WRITE;
/*!40000 ALTER TABLE `hrapp_section` DISABLE KEYS */;
INSERT INTO `hrapp_section` VALUES (1,'Section 1',0,'2025-04-04 05:09:08.302631','2025-04-04 07:26:42.530644',3,'1'),(2,'Section 2',1,'2025-04-04 05:13:59.391440','2025-04-04 07:26:38.288457',3,'1');
/*!40000 ALTER TABLE `hrapp_section` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_section_students`
--

DROP TABLE IF EXISTS `hrapp_section_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_section_students` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `section_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hrapp_section_students_section_id_user_id_1eab5a99_uniq` (`section_id`,`user_id`),
  KEY `hrapp_section_students_user_id_022d74c8_fk_hrapp_user_id` (`user_id`),
  CONSTRAINT `hrapp_section_students_section_id_0ebf5185_fk_hrapp_section_id` FOREIGN KEY (`section_id`) REFERENCES `hrapp_section` (`id`),
  CONSTRAINT `hrapp_section_students_user_id_022d74c8_fk_hrapp_user_id` FOREIGN KEY (`user_id`) REFERENCES `hrapp_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_section_students`
--

LOCK TABLES `hrapp_section_students` WRITE;
/*!40000 ALTER TABLE `hrapp_section_students` DISABLE KEYS */;
INSERT INTO `hrapp_section_students` VALUES (1,1,1),(2,1,2),(3,1,5),(4,1,6),(5,2,1),(6,2,2);
/*!40000 ALTER TABLE `hrapp_section_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_studentevaluation`
--

DROP TABLE IF EXISTS `hrapp_studentevaluation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_studentevaluation` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` longtext,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `user_professor_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hrapp_studentevaluat_user_professor_id_8e8cac54_fk_hrapp_use` (`user_professor_id`),
  CONSTRAINT `hrapp_studentevaluat_user_professor_id_8e8cac54_fk_hrapp_use` FOREIGN KEY (`user_professor_id`) REFERENCES `hrapp_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_studentevaluation`
--

LOCK TABLES `hrapp_studentevaluation` WRITE;
/*!40000 ALTER TABLE `hrapp_studentevaluation` DISABLE KEYS */;
INSERT INTO `hrapp_studentevaluation` VALUES (1,'SFF - For Networking','SFF FEEDBACK STUDENT','2025-04-03 07:43:46.975185','2025-04-03 07:45:49.172188',NULL,2),(2,'SFF FOR JAZEL ALIM','SFF FOR JAZEL ALIM','2025-04-03 07:46:32.900374','2025-04-03 07:46:32.900374',NULL,3);
/*!40000 ALTER TABLE `hrapp_studentevaluation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_studentevaluation_import_questions`
--

DROP TABLE IF EXISTS `hrapp_studentevaluation_import_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_studentevaluation_import_questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `studentevaluation_id` bigint NOT NULL,
  `studentevaluationquestion_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hrapp_studentevaluation__studentevaluation_id_stu_2882f65b_uniq` (`studentevaluation_id`,`studentevaluationquestion_id`),
  KEY `hrapp_studentevaluat_studentevaluationque_3bff730c_fk_hrapp_stu` (`studentevaluationquestion_id`),
  CONSTRAINT `hrapp_studentevaluat_studentevaluation_id_38f1a263_fk_hrapp_stu` FOREIGN KEY (`studentevaluation_id`) REFERENCES `hrapp_studentevaluation` (`id`),
  CONSTRAINT `hrapp_studentevaluat_studentevaluationque_3bff730c_fk_hrapp_stu` FOREIGN KEY (`studentevaluationquestion_id`) REFERENCES `hrapp_studentevaluationquestion` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_studentevaluation_import_questions`
--

LOCK TABLES `hrapp_studentevaluation_import_questions` WRITE;
/*!40000 ALTER TABLE `hrapp_studentevaluation_import_questions` DISABLE KEYS */;
INSERT INTO `hrapp_studentevaluation_import_questions` VALUES (1,1,1),(2,1,2),(3,1,3),(4,2,1),(5,2,2),(6,2,3);
/*!40000 ALTER TABLE `hrapp_studentevaluation_import_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_studentevaluationquestion`
--

DROP TABLE IF EXISTS `hrapp_studentevaluationquestion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_studentevaluationquestion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question` longtext NOT NULL,
  `type` varchar(15) NOT NULL,
  `options` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `student_evaluation_id` bigint DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hrapp_studentevaluat_student_evaluation_i_18fa77e5_fk_hrapp_stu` (`student_evaluation_id`),
  CONSTRAINT `hrapp_studentevaluat_student_evaluation_i_18fa77e5_fk_hrapp_stu` FOREIGN KEY (`student_evaluation_id`) REFERENCES `hrapp_studentevaluation` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_studentevaluationquestion`
--

LOCK TABLES `hrapp_studentevaluationquestion` WRITE;
/*!40000 ALTER TABLE `hrapp_studentevaluationquestion` DISABLE KEYS */;
INSERT INTO `hrapp_studentevaluationquestion` VALUES (1,'WHAT IS YOUR COMMENT TO THIS PROF','TEXT',NULL,'2025-04-03 07:44:15.668769','2025-04-03 07:44:15.668769',1,NULL),(2,'RATE THIS PROF FROM 1 - 10','RATING',NULL,'2025-04-03 07:44:32.321433','2025-04-03 07:44:32.321433',1,NULL),(3,'WAS THIS PROF HELPFUL TO YOUR STUDY JOURNEY','MCQ',NULL,'2025-04-03 07:45:04.754218','2025-04-03 07:45:04.754218',1,NULL);
/*!40000 ALTER TABLE `hrapp_studentevaluationquestion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_studentevaluationresponse`
--

DROP TABLE IF EXISTS `hrapp_studentevaluationresponse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_studentevaluationresponse` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `answer` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `schedule_id` bigint DEFAULT NULL,
  `student_eval_question_id` bigint DEFAULT NULL,
  `student_evaluation_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hrapp_studentevaluat_schedule_id_ad27fc0f_fk_hrapp_sch` (`schedule_id`),
  KEY `hrapp_studentevaluat_student_eval_questio_fdc327bb_fk_hrapp_stu` (`student_eval_question_id`),
  KEY `hrapp_studentevaluat_student_evaluation_i_9d41dd96_fk_hrapp_stu` (`student_evaluation_id`),
  KEY `hrapp_studentevaluat_user_id_38a51ba8_fk_hrapp_use` (`user_id`),
  CONSTRAINT `hrapp_studentevaluat_schedule_id_ad27fc0f_fk_hrapp_sch` FOREIGN KEY (`schedule_id`) REFERENCES `hrapp_schedule` (`id`),
  CONSTRAINT `hrapp_studentevaluat_student_eval_questio_fdc327bb_fk_hrapp_stu` FOREIGN KEY (`student_eval_question_id`) REFERENCES `hrapp_studentevaluationquestion` (`id`),
  CONSTRAINT `hrapp_studentevaluat_student_evaluation_i_9d41dd96_fk_hrapp_stu` FOREIGN KEY (`student_evaluation_id`) REFERENCES `hrapp_studentevaluation` (`id`),
  CONSTRAINT `hrapp_studentevaluat_user_id_38a51ba8_fk_hrapp_use` FOREIGN KEY (`user_id`) REFERENCES `hrapp_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_studentevaluationresponse`
--

LOCK TABLES `hrapp_studentevaluationresponse` WRITE;
/*!40000 ALTER TABLE `hrapp_studentevaluationresponse` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrapp_studentevaluationresponse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_subject`
--

DROP TABLE IF EXISTS `hrapp_subject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_subject` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_subject`
--

LOCK TABLES `hrapp_subject` WRITE;
/*!40000 ALTER TABLE `hrapp_subject` DISABLE KEYS */;
INSERT INTO `hrapp_subject` VALUES (2,'Networking II','NET-2',1,NULL,'2025-04-03 07:53:18.514301','2025-04-03 07:53:18.514301'),(3,'Panitikang Filipino','FIL-127',1,NULL,'2025-04-04 05:21:00.591703','2025-04-04 05:21:00.591703');
/*!40000 ALTER TABLE `hrapp_subject` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_user`
--

DROP TABLE IF EXISTS `hrapp_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `email` varchar(254) NOT NULL,
  `supervisor_id` bigint DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `hrapp_user_supervisor_id_497635d9_fk_hrapp_user_id` (`supervisor_id`),
  CONSTRAINT `hrapp_user_supervisor_id_497635d9_fk_hrapp_user_id` FOREIGN KEY (`supervisor_id`) REFERENCES `hrapp_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_user`
--

LOCK TABLES `hrapp_user` WRITE;
/*!40000 ALTER TABLE `hrapp_user` DISABLE KEYS */;
INSERT INTO `hrapp_user` VALUES (1,'pbkdf2_sha256$870000$pdc3Flx4xIBEeui8IAsW3T$TiK99ovRwDA0hYUppVQIfjpur4EsTFpPnUf0BwQTxq4=','2025-04-23 06:53:14.057876',1,'Tinangeli','atlia','',1,1,'2025-04-03 04:49:41.000000','espinedamartin14@yahoo.com',NULL,0),(2,'pbkdf2_sha256$870000$c1pTV1optxCeoi8RiF7zna$w//3N3WJmKfjK/KyrMWnrSPM0jGaMFZvsObxlwgic8E=',NULL,0,'atilia','Jazel','Alim',0,1,'2025-04-03 04:55:43.763754','alimjazel14@gmail.com',NULL,0),(3,'pbkdf2_sha256$870000$lO4uWw9kugvGZ7KEF1LnNC$3qHalnASzxcL7Z7ZtJQzP3ih/uXs9SlVNENJsb1GGx8=',NULL,0,'Rjdawal','Francisco','Dawal',0,1,'2025-04-03 06:33:06.000000','rjdaw.sjc@phinmaed.com',4,0),(4,'pbkdf2_sha256$1000000$owIph9FiGwVHENp5KaWvOx$WPqmrkVrWiVgwWVbvMLgE1PN0G0B2gdKn6RxSd/sPqw=',NULL,0,'rommeldeocaris','Rommel','Deocaris',0,1,'2025-04-03 07:32:41.000000','romdeo.sjc@phinmaed.com',NULL,0),(5,'pbkdf2_sha256$870000$MVsLpR7ED83yiGoZm7g28h$ULKu5+fNh5o/W+vq2LlDFPkUJ9FkOIiEuSA+uJ0+Y1g=',NULL,0,'chstrsp','Chester','Espineda',0,1,'2025-04-04 05:10:07.154787','chor.sjc@phinmaed.com',NULL,0),(6,'pbkdf2_sha256$1000000$SxKARo0kRMYasSr0WOH8Yr$4ZJdVedu5sMQ7oCq+4etHVHk7Lx2Bk4Ro+tHyAB7F/0=',NULL,0,'yourlifemymeme','Renzo','Cua',0,1,'2025-04-04 05:12:11.967684','rencua.sjc@phinmaed.com',NULL,0),(7,'pbkdf2_sha256$870000$dRvU8NRzyMCOaG2bGlgz1I$iQZYNohlEb+nXZj/+cpKUoWo/UBFY6zvXBXjhzkcKa0=',NULL,0,'HazeDulay','Hazel','Dulay',0,1,'2025-04-04 05:15:47.000000','HazelDulay@phinmaed.com',8,0),(8,'pbkdf2_sha256$870000$8l9rpcu2i1I0muCl1kCXOF$xIgVFYhwWApCGyEFqhxIK6YgfDAatP56YIYptalb7lE=',NULL,0,'JulieDayat','Juliet','Dayat',0,1,'2025-04-04 05:19:42.000000','JuDayat.sjc@phinmaed.com',NULL,0),(9,'pbkdf2_sha256$870000$mJCYiqRKXQSTo5D4Fs12wJ$BrcpWE8Yfy1D6LXGc90gJj3OUWB4d9fjwJMrk0MpyrM=',NULL,0,'Tinsample','','',0,1,'2025-04-23 06:53:53.389776','espndmartin@gmail.com',NULL,0);
/*!40000 ALTER TABLE `hrapp_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_user_groups`
--

DROP TABLE IF EXISTS `hrapp_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hrapp_user_groups_user_id_group_id_3eb8dd1c_uniq` (`user_id`,`group_id`),
  KEY `hrapp_user_groups_group_id_63f27bfe_fk_auth_group_id` (`group_id`),
  CONSTRAINT `hrapp_user_groups_group_id_63f27bfe_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `hrapp_user_groups_user_id_18e44cc2_fk_hrapp_user_id` FOREIGN KEY (`user_id`) REFERENCES `hrapp_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_user_groups`
--

LOCK TABLES `hrapp_user_groups` WRITE;
/*!40000 ALTER TABLE `hrapp_user_groups` DISABLE KEYS */;
INSERT INTO `hrapp_user_groups` VALUES (1,1,1),(2,2,1),(13,3,4),(5,4,2),(6,5,1),(7,6,1),(11,7,4),(12,8,2),(14,9,1);
/*!40000 ALTER TABLE `hrapp_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_user_user_permissions`
--

DROP TABLE IF EXISTS `hrapp_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hrapp_user_user_permissions_user_id_permission_id_ca26d7c3_uniq` (`user_id`,`permission_id`),
  KEY `hrapp_user_user_perm_permission_id_cf03c749_fk_auth_perm` (`permission_id`),
  CONSTRAINT `hrapp_user_user_perm_permission_id_cf03c749_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `hrapp_user_user_permissions_user_id_9bd2f1df_fk_hrapp_user_id` FOREIGN KEY (`user_id`) REFERENCES `hrapp_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_user_user_permissions`
--

LOCK TABLES `hrapp_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `hrapp_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrapp_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-23 15:51:27
