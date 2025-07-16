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

) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
INSERT INTO `auth_group` VALUES (2,'Dean'),(5,'HR'),(4,'Professor'),(3,'Program Head'),(1,'Student');
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

) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
INSERT INTO `auth_group_permissions` VALUES (43,1,32),(45,1,36),(42,1,48),(44,1,56),(46,2,21),(47,2,22),(48,2,23),(49,2,24),(50,2,25),(51,2,26),(52,2,27),(53,2,28),(54,2,33),(55,2,34),(56,2,35),(57,2,36),(58,2,41),(59,2,42),(60,2,43),(61,2,44),(62,2,45),(63,2,46),(64,2,47),(65,2,48),(66,2,49),(67,2,50),(68,2,52),(69,2,60),(70,2,61),(71,2,62),(72,2,63),(73,2,64),(74,2,65),(75,2,66),(76,2,67),(77,2,68),(78,2,69),(79,2,70),(80,2,71),(81,2,72),(1,3,21),(2,3,22),(3,3,23),(4,3,24),(5,3,25),(6,3,26),(7,3,27),(8,3,28),(9,3,29),(10,3,30),(11,3,31),(12,3,32),(13,3,33),(14,3,34),(15,3,35),(16,3,36),(17,3,40),(18,3,41),(19,3,42),(20,3,43),(21,3,44),(22,3,45),(23,3,46),(24,3,47),(25,3,48),(26,3,49),(27,3,50),(28,3,51),(29,3,52),(30,3,56),(31,3,60),(39,4,24),(41,4,28),(32,4,32),(33,4,36),(34,4,40),(35,4,44),(37,4,48),(38,4,52),(40,4,56),(36,4,60),(82,5,33),(83,5,34),(84,5,35),(85,5,36),(86,5,37),(87,5,38),(88,5,39),(89,5,40),(90,5,57),(91,5,58),(92,5,59),(93,5,60);
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

) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add permission',1,'add_permission'),(2,'Can change permission',1,'change_permission'),(3,'Can delete permission',1,'delete_permission'),(4,'Can view permission',1,'view_permission'),(5,'Can add group',2,'add_group'),(6,'Can change group',2,'change_group'),(7,'Can delete group',2,'delete_group'),(8,'Can view group',2,'view_group'),(9,'Can add content type',3,'add_contenttype'),(10,'Can change content type',3,'change_contenttype'),(11,'Can delete content type',3,'delete_contenttype'),(12,'Can view content type',3,'view_contenttype'),(13,'Can add session',4,'add_session'),(14,'Can change session',4,'change_session'),(15,'Can delete session',4,'delete_session'),(16,'Can view session',4,'view_session'),(17,'Can add log entry',5,'add_logentry'),(18,'Can change log entry',5,'change_logentry'),(19,'Can delete log entry',5,'delete_logentry'),(20,'Can view log entry',5,'view_logentry'),(21,'Can add course',6,'add_course'),(22,'Can change course',6,'change_course'),(23,'Can delete course',6,'delete_course'),(24,'Can view course',6,'view_course'),(25,'Can add room',7,'add_room'),(26,'Can change room',7,'change_room'),(27,'Can delete room',7,'delete_room'),(28,'Can view room',7,'view_room'),(29,'Can add student evaluation',8,'add_studentevaluation'),(30,'Can change student evaluation',8,'change_studentevaluation'),(31,'Can delete student evaluation',8,'delete_studentevaluation'),(32,'Can view student evaluation',8,'view_studentevaluation'),(33,'Can add subject',9,'add_subject'),(34,'Can change subject',9,'change_subject'),(35,'Can delete subject',9,'delete_subject'),(36,'Can view subject',9,'view_subject'),(37,'Can add user',10,'add_user'),(38,'Can change user',10,'change_user'),(39,'Can delete user',10,'delete_user'),(40,'Can view user',10,'view_user'),(41,'Can add schedule',11,'add_schedule'),(42,'Can change schedule',11,'change_schedule'),(43,'Can delete schedule',11,'delete_schedule'),(44,'Can view schedule',11,'view_schedule'),(45,'Can add faculty assignment',12,'add_facultyassignment'),(46,'Can change faculty assignment',12,'change_facultyassignment'),(47,'Can delete faculty assignment',12,'delete_facultyassignment'),(48,'Can view faculty assignment',12,'view_facultyassignment'),(49,'Can add evaluation',13,'add_evaluation'),(50,'Can change evaluation',13,'change_evaluation'),(51,'Can delete evaluation',13,'delete_evaluation'),(52,'Can view evaluation',13,'view_evaluation'),(53,'Can add student evaluation question',14,'add_studentevaluationquestion'),(54,'Can change student evaluation question',14,'change_studentevaluationquestion'),(55,'Can delete student evaluation question',14,'delete_studentevaluationquestion'),(56,'Can view student evaluation question',14,'view_studentevaluationquestion'),(57,'Can add student evaluation response',15,'add_studentevaluationresponse'),(58,'Can change student evaluation response',15,'change_studentevaluationresponse'),(59,'Can delete student evaluation response',15,'delete_studentevaluationresponse'),(60,'Can view student evaluation response',15,'view_studentevaluationresponse'),(61,'Can add course professor',16,'add_courseprofessor'),(62,'Can change course professor',16,'change_courseprofessor'),(63,'Can delete course professor',16,'delete_courseprofessor'),(64,'Can view course professor',16,'view_courseprofessor'),(65,'Can add faculty schedule',17,'add_facultyschedule'),(66,'Can change faculty schedule',17,'change_facultyschedule'),(67,'Can delete faculty schedule',17,'delete_facultyschedule'),(68,'Can view faculty schedule',17,'view_facultyschedule'),(69,'Can add section',18,'add_section'),(70,'Can change section',18,'change_section'),(71,'Can delete section',18,'delete_section'),(72,'Can view section',18,'view_section'),(73,'Can add Token',19,'add_token'),(74,'Can change Token',19,'change_token'),(75,'Can delete Token',19,'delete_token'),(76,'Can view Token',19,'view_token'),(77,'Can add Token',20,'add_tokenproxy'),(78,'Can change Token',20,'change_tokenproxy'),(79,'Can delete Token',20,'delete_tokenproxy'),(80,'Can view Token',20,'view_tokenproxy'),(81,'Can add evaluation evaluator',21,'add_evaluationevaluator'),(82,'Can change evaluation evaluator',21,'change_evaluationevaluator'),(83,'Can delete evaluation evaluator',21,'delete_evaluationevaluator'),(84,'Can view evaluation evaluator',21,'view_evaluationevaluator'),(85,'Can add evaluation instructor',22,'add_evaluationinstructor'),(86,'Can change evaluation instructor',22,'change_evaluationinstructor'),(87,'Can delete evaluation instructor',22,'delete_evaluationinstructor'),(88,'Can view evaluation instructor',22,'view_evaluationinstructor'),(89,'Can add token',23,'add_token'),(90,'Can change token',23,'change_token'),(91,'Can delete token',23,'delete_token'),(92,'Can view token',23,'view_token'),(93,'Can add program',24,'add_program'),(94,'Can change program',24,'change_program'),(95,'Can delete program',24,'delete_program'),(96,'Can view program',24,'view_program'),(97,'Can add program professor',25,'add_programprofessor'),(98,'Can change program professor',25,'change_programprofessor'),(99,'Can delete program professor',25,'delete_programprofessor'),(100,'Can view program professor',25,'view_programprofessor'),(101,'Can add timestamp',26,'add_timestamp'),(102,'Can change timestamp',26,'change_timestamp'),(103,'Can delete timestamp',26,'delete_timestamp'),(104,'Can view timestamp',26,'view_timestamp'),(105,'Can add faculty',27,'add_faculty'),(106,'Can change faculty',27,'change_faculty'),(107,'Can delete faculty',27,'delete_faculty'),(108,'Can view faculty',27,'view_faculty');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authtoken_token`
--

LOCK TABLES `authtoken_token` WRITE;
/*!40000 ALTER TABLE `authtoken_token` DISABLE KEYS */;

INSERT INTO `authtoken_token` VALUES ('1f3a187f47e98f6d199aba6af131578b0318b4c0','2025-07-01 09:06:15.025997',26),('68c28ae40c0d1a4b9f90acdf4f201a1e6d6d3217','2025-06-16 03:46:46.851104',24),('7ed00a489e520a553536e00bd2383250ace53e6e','2025-07-01 09:08:38.286044',27),('c1fb4d00dbdd79c9135ef789260f7bef9d7fa2db','2025-07-16 04:33:41.241738',1),('c91f5a18786d691c2577ece77a71a34e1eb7ea34','2025-07-10 09:18:06.048199',30);

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

) ENGINE=InnoDB AUTO_INCREMENT=363 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;

INSERT INTO `django_admin_log` VALUES (1,'2025-04-03 04:55:44.395285','2','alimjazel14@gmail.com',1,'[{\"added\": {}}]',10,1),(2,'2025-04-03 04:56:57.364440','1','BSIT - Bachelors of Science in Information Technology - BSIT - BSIT - True - 2025-04-03 04:56:57.363440+00:00 - 2025-04-03 04:56:57.363440+00:00 - None',1,'[{\"added\": {}}]',6,1),(3,'2025-04-03 04:57:27.533442','1','Comlab - 1 - CL-1 - False - 2025-04-03 04:57:27.533442+00:00 - 2025-04-03 04:57:27.533442+00:00 - None',1,'[{\"added\": {}}]',7,1),(4,'2025-04-03 04:57:34.670674','1','Comlab - 1 - CL-1 - True - 2025-04-03 04:57:27.533442+00:00 - 2025-04-03 04:57:34.670674+00:00 - None',2,'[{\"changed\": {\"fields\": [\"Is active\"]}}]',7,1),(5,'2025-04-03 05:00:55.675094','1','Networking II - NET-2 - True - 2025-04-03 05:00:55.675094+00:00 - 2025-04-03 05:00:55.675094+00:00 - None',1,'[{\"added\": {}}]',9,1),(6,'2025-04-03 06:09:19.181812','2','Dean',1,'[{\"added\": {}}]',2,1),(7,'2025-04-03 06:09:28.251837','3','Program Head',1,'[{\"added\": {}}]',2,1),(8,'2025-04-03 06:12:24.597056','3','Program Head',2,'[{\"changed\": {\"fields\": [\"Permissions\"]}}]',2,1),(9,'2025-04-03 06:16:11.274030','1','Comlab - 1 - CL-1 - True - 2025-04-03 04:57:27.533442+00:00 - 2025-04-03 04:57:34.670674+00:00 - None',3,'',7,1),(10,'2025-04-03 06:16:17.353446','1','Networking II - NET-2 - True - 2025-04-03 05:00:55.675094+00:00 - 2025-04-03 05:00:55.675094+00:00 - None',3,'',9,1),(11,'2025-04-03 06:33:07.590259','3','rjdaw.sjc@phinmaed.com',1,'[{\"added\": {}}]',10,1),(12,'2025-04-03 06:34:20.671778','4','Professor',1,'[{\"added\": {}}]',2,1),(13,'2025-04-03 07:32:41.771835','4','romdeo.sjc@phinmaed.com',1,'[{\"added\": {}}]',10,1),(14,'2025-04-03 07:32:52.379773','4','romdeo.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(15,'2025-04-03 07:33:02.562233','3','rjdaw.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Supervisor\"]}}]',10,1),(16,'2025-04-03 07:43:46.981228','1','SFF - For Networking - SFF FEEDBACK STUDENT - 2025-04-03 07:43:46.975185+00:00 - 2025-04-03 07:43:46.975185+00:00 - None',1,'[{\"added\": {}}]',8,1),(17,'2025-04-03 07:44:15.668769','1','WHAT IS YOUR COMMENT TO THIS PROF - TEXT - 2025-04-03 07:44:15.668769+00:00 - 2025-04-03 07:44:15.668769+00:00 - None',1,'[{\"added\": {}}]',14,1),(18,'2025-04-03 07:44:32.322432','2','RATE THIS PROF FROM 1 - 10 - RATING - 2025-04-03 07:44:32.321433+00:00 - 2025-04-03 07:44:32.321433+00:00 - None',1,'[{\"added\": {}}]',14,1),(19,'2025-04-03 07:45:04.758723','3','WAS THIS PROF HELPFUL TO YOUR STUDY JOURNEY - MCQ - 2025-04-03 07:45:04.754218+00:00 - 2025-04-03 07:45:04.754218+00:00 - None',1,'[{\"added\": {}}]',14,1),(20,'2025-04-03 07:45:49.175878','1','SFF - For Networking - SFF FEEDBACK STUDENT - 2025-04-03 07:43:46.975185+00:00 - 2025-04-03 07:45:49.172188+00:00 - None',2,'[{\"changed\": {\"fields\": [\"User professor\", \"Import questions\"]}}]',8,1),(21,'2025-04-03 07:46:32.905056','2','SFF FOR JAZEL ALIM - SFF FOR JAZEL ALIM - 2025-04-03 07:46:32.900374+00:00 - 2025-04-03 07:46:32.900374+00:00 - None',1,'[{\"added\": {}}]',8,1),(22,'2025-04-03 07:52:51.521267','3','BSIT - Bachelors of Science in Information Technology - BSIT - BSIT - True - 2025-04-03 07:52:51.521267+00:00 - 2025-04-03 07:52:51.521267+00:00 - None',1,'[{\"added\": {}}, {\"added\": {\"name\": \"course professor\", \"object\": \"rjdaw.sjc@phinmaed.com - BSIT - Bachelors of Science in Information Technology - BSIT - BSIT - True - 2025-04-03 07:52:51.521267+00:00 - 2025-04-03 07:52:51.521267+00:00 - None - 2025-04-03 07:52:51.521267+00:00\"}}]',6,1),(23,'2025-04-03 07:53:05.182559','2','Comlab - 1 - CL-1 - True - 2025-04-03 07:53:05.181559+00:00 - 2025-04-03 07:53:05.181559+00:00 - None',1,'[{\"added\": {}}]',7,1),(24,'2025-04-03 07:53:18.514301','2','Networking II - NET-2 - True - 2025-04-03 07:53:18.514301+00:00 - 2025-04-03 07:53:18.514301+00:00 - None',1,'[{\"added\": {}}]',9,1),(25,'2025-04-04 02:34:52.945496','3','BSIT - Bachelors of Science in Information Technology - BSIT - BSIT - True - 2025-04-03 07:52:51.521267+00:00 - 2025-04-04 02:34:52.942435+00:00 - None',2,'[{\"added\": {\"name\": \"course professor\", \"object\": \"alimjazel14@gmail.com - BSIT - Bachelors of Science in Information Technology - BSIT - BSIT - True - 2025-04-03 07:52:51.521267+00:00 - 2025-04-04 02:34:52.942435+00:00 - None - 2025-04-04 02:34:52.943861+00:00\"}}]',6,1),(26,'2025-04-04 05:09:08.309790','1','First Year - BSIT - Bachelors of Science in Information Technology',1,'[{\"added\": {}}]',18,1),(27,'2025-04-04 05:10:07.779320','5','chor.sjc@phinmaed.com',1,'[{\"added\": {}}]',10,1),(28,'2025-04-04 05:11:16.503095','1','Student',2,'[{\"changed\": {\"fields\": [\"Permissions\"]}}]',2,1),(29,'2025-04-04 05:12:12.576081','6','rencua.sjc@phinmaed.com',1,'[{\"added\": {}}]',10,1),(30,'2025-04-04 05:13:19.128478','1','First Year - BSIT - Bachelors of Science in Information Technology',2,'[{\"changed\": {\"fields\": [\"Students\"]}}]',18,1),(31,'2025-04-04 05:13:47.030670','1','Section 1 - BSIT - Bachelors of Science in Information Technology',2,'[{\"changed\": {\"fields\": [\"Name\"]}}]',18,1),(32,'2025-04-04 05:13:59.392806','2','Section 2 - BSIT - Bachelors of Science in Information Technology',1,'[{\"added\": {}}]',18,1),(33,'2025-04-04 05:15:47.622440','7','HazelDulay@phinmaed.com',1,'[{\"added\": {}}]',10,1),(34,'2025-04-04 05:18:43.462322','7','HazelDulay@phinmaed.com',2,'[]',10,1),(35,'2025-04-04 05:19:43.344903','8','JuDayat.sjc@phinmaed.com',1,'[{\"added\": {}}]',10,1),(36,'2025-04-04 05:19:52.923757','8','JuDayat.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(37,'2025-04-04 05:20:04.349722','7','HazelDulay@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(38,'2025-04-04 05:20:25.845612','1','espinedamartin14@yahoo.com',2,'[{\"changed\": {\"fields\": [\"First name\"]}}]',10,1),(39,'2025-04-04 05:21:00.591703','3','Panitikang Filipino - FIL-127 - True - 2025-04-04 05:21:00.591703+00:00 - 2025-04-04 05:21:00.591703+00:00 - None',1,'[{\"added\": {}}]',9,1),(40,'2025-04-04 05:21:33.561765','3','BSIT - Bachelors of Science in Information Technology - BSIT - BSIT - True - 2025-04-03 07:52:51.521267+00:00 - 2025-04-04 05:21:33.561765+00:00 - None',2,'[{\"added\": {\"name\": \"course professor\", \"object\": \"romdeo.sjc@phinmaed.com - BSIT - Bachelors of Science in Information Technology - BSIT - BSIT - True - 2025-04-03 07:52:51.521267+00:00 - 2025-04-04 05:21:33.561765+00:00 - None - 2025-04-04 05:21:33.561765+00:00\"}}]',6,1),(41,'2025-04-04 05:22:04.378388','4','CAAS - College of Arts and Sciences - CAAS - CAAS - True - 2025-04-04 05:22:04.378388+00:00 - 2025-04-04 05:22:04.378388+00:00 - None',1,'[{\"added\": {}}, {\"added\": {\"name\": \"course professor\", \"object\": \"JuDayat.sjc@phinmaed.com - CAAS - College of Arts and Sciences - CAAS - CAAS - True - 2025-04-04 05:22:04.378388+00:00 - 2025-04-04 05:22:04.378388+00:00 - None - 2025-04-04 05:22:04.378388+00:00\"}}, {\"added\": {\"name\": \"course professor\", \"object\": \"HazelDulay@phinmaed.com - CAAS - College of Arts and Sciences - CAAS - CAAS - True - 2025-04-04 05:22:04.378388+00:00 - 2025-04-04 05:22:04.378388+00:00 - None - 2025-04-04 05:22:04.378388+00:00\"}}]',6,1),(42,'2025-04-04 05:22:42.777660','3','D-204 - D-204 - True - 2025-04-04 05:22:42.777660+00:00 - 2025-04-04 05:22:42.777660+00:00 - None',1,'[{\"added\": {}}]',7,1),(43,'2025-04-04 05:27:04.090517','7','HazelDulay@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Supervisor\"]}}]',10,1),(44,'2025-04-04 05:27:10.594457','3','rjdaw.sjc@phinmaed.com',2,'[]',10,1),(45,'2025-04-04 07:26:38.288457','2','Section 2 - BSIT - Bachelors of Science in Information Technology',2,'[{\"changed\": {\"fields\": [\"Year level\"]}}]',18,1),(46,'2025-04-04 07:26:42.530644','1','Section 1 - BSIT - Bachelors of Science in Information Technology',2,'[{\"changed\": {\"fields\": [\"Year level\"]}}]',18,1),(47,'2025-04-04 07:51:01.416933','1','  Year 1 - Section 1  - BSIT - Bachelors of Science in Information Technology  - Networking II - NET-2 - True - 2025-04-03 07:53:18.514301+00:00 - 2025-04-03 07:53:18.514301+00:00 - None - Comlab - 1 ',1,'[{\"added\": {}}]',11,1),(48,'2025-04-07 02:20:15.528863','1','  Year 1 - Section 1  - BSIT - Bachelors of Science in Information Technology  - Networking II - NET-2 - True  - Comlab - 1 - CL-1 - True - BSIT 1-1 NET - 12:00:00 - 13:30:00 - First - 2024-2025 - Tru',2,'[{\"changed\": {\"fields\": [\"Name\"]}}]',11,1),(49,'2025-04-07 02:37:00.608533','8','JuDayat.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(50,'2025-04-07 02:37:12.297698','3','rjdaw.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(51,'2025-04-07 02:56:19.528318','1','romdeo.sjc@phinmaed.com',1,'[{\"added\": {}}, {\"added\": {\"name\": \"faculty schedule\", \"object\": \"romdeo.sjc@phinmaed.com -> BSIT 1-1 NET at 2025-04-07 02:56:19.528318+00:00\"}}]',12,1),(52,'2025-04-07 08:24:47.517888','2','chor.sjc@phinmaed.com',1,'[{\"added\": {}}]',12,1),(53,'2025-04-07 08:28:15.264173','2','chor.sjc@phinmaed.com',2,'[{\"added\": {\"name\": \"faculty schedule\", \"object\": \"chor.sjc@phinmaed.com -> BSIT 1-1 NET at 2025-04-07 08:28:15.263095+00:00\"}}, {\"added\": {\"name\": \"faculty schedule\", \"object\": \"chor.sjc@phinmaed.com -> BSIT 1-1 NET at 2025-04-07 08:28:15.264173+00:00\"}}]',12,1),(54,'2025-04-08 02:36:07.427193','4','romdeo.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',10,1),(55,'2025-04-08 02:57:00.304812','4','romdeo.sjc@phinmaed.com',2,'[]',10,1),(56,'2025-04-08 03:18:36.434110','2','Dean',2,'[{\"changed\": {\"fields\": [\"Permissions\"]}}]',2,1),(57,'2025-04-08 03:34:29.205098','4','romdeo.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',10,1),(58,'2025-04-08 03:34:34.709369','4','romdeo.sjc@phinmaed.com',2,'[]',10,1),(59,'2025-04-08 03:35:06.553486','4','romdeo.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Username\"]}}]',10,1),(60,'2025-04-23 07:42:21.927567','11','319bf668356de85f2e3ab6e53f75330ee51c023a',3,'',20,1),(61,'2025-04-23 07:42:25.953754','12','758941880a64b3bf59cb617a7f426e8473564c83',3,'',20,1),(62,'2025-04-23 07:42:29.139842','13','e4979d4f894759c0fe552c1cf43c6b74de9ccd29',3,'',20,1),(63,'2025-04-23 07:42:34.005133','14','1d8d7e490d289457b644afa53585b8338585d596',3,'',20,1),(64,'2025-04-23 07:42:52.196711','13','sample.4sjc@phinmaed.com',3,'',10,1),(65,'2025-04-23 07:42:58.930144','10','sample.sjc@phinmaed.com',3,'',10,1),(66,'2025-04-23 07:43:03.143696','15','sample6.sjc@phinmaed.com',3,'',10,1),(67,'2025-04-23 07:43:06.093284','14','sample5.sjc@phinmaed.com',3,'',10,1),(68,'2025-04-23 07:43:10.181458','11','sample.2sjc@phinmaed.com',3,'',10,1),(69,'2025-04-23 07:43:13.040825','12','sample.3sjc@phinmaed.com',3,'',10,1),(70,'2025-04-24 02:06:03.982152','9','espndmartin@gmail.com',3,'',10,1),(71,'2025-04-24 04:07:23.997752','17','maor.espineda.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',10,1),(72,'2025-04-29 05:34:31.204420','1','espinedamartin14@yahoo.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(73,'2025-04-29 05:38:57.612000','6','rencua.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',10,1),(74,'2025-04-29 05:38:59.115701','6','rencua.sjc@phinmaed.com',2,'[]',10,1),(75,'2025-04-29 08:07:02.002678','18','ches.espineda.sjc@phinmaed.com',1,'[{\"added\": {}}]',10,1),(76,'2025-05-06 03:51:14.727453','5','Human Resource',1,'[{\"added\": {}}]',2,1),(77,'2025-05-06 04:24:58.943699','5','HR',2,'[{\"changed\": {\"fields\": [\"Name\"]}}]',2,1),(78,'2025-05-06 08:15:21.208370','17','maor.espineda.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',10,1),(79,'2025-05-20 20:52:40.786839','17','4af5d55e0a1624f39cd9e2f21f39a4ff3714a0d5',3,'',20,1),(80,'2025-05-20 20:52:49.372411','16','f01a22baa8be478c535d48a7d5fa93fc4df9a721',3,'',20,1),(81,'2025-05-20 20:52:52.667277','19','11a38ea72ce6da874a555cc359a0955cfca529aa',3,'',20,1),(82,'2025-05-20 20:52:55.973090','1','c07aa27725a4f48509967b2aea487699e952e2a5',3,'',20,1),(83,'2025-05-20 20:52:59.032162','4','a12cbbae556f980033a90a25f00d9eb5207903a5',3,'',20,1),(84,'2025-05-20 20:53:02.028840','6','0927c69f3bb09dc25242c375de3717c252231709',3,'',20,1),(85,'2025-05-20 21:10:59.205271','1','153c18a1a09e7f9bae495b27ead918d40071c738',3,'',20,1),(86,'2025-05-21 07:02:47.442446','1','Evaluation #1 on 2025-05-21',1,'[{\"added\": {}}]',13,1),(87,'2025-05-23 02:52:24.646840','4','Comlab - 2 (Active)',1,'[{\"added\": {}}]',7,1),(88,'2025-05-23 02:52:46.926953','5','Dimasalang - 205 (Active)',1,'[{\"added\": {}}]',7,1),(89,'2025-05-23 02:53:12.651541','6','Dimasalang - 206 (Active)',1,'[{\"added\": {}}]',7,1),(90,'2025-05-23 05:20:30.141690','2','Schedule: Networking II (First 2025-05-23), Comlab - 1, 13:20:08 - 14:20:11',1,'[{\"added\": {}}]',11,1),(91,'2025-05-26 03:06:18.011137','4','Human Computer Interaction 1 (Active)',1,'[{\"added\": {}}]',9,1),(92,'2025-05-26 03:06:29.289897','4','Human Computer Interaction 1 (Active)',2,'[{\"changed\": {\"fields\": [\"Slug\"]}}]',9,1),(93,'2025-05-26 03:06:46.149364','5','Systems Integration and Architecture 1 (Active)',1,'[{\"added\": {}}]',9,1),(94,'2025-05-26 03:06:58.149899','6','Intelligent Systems (Active)',1,'[{\"added\": {}}]',9,1),(95,'2025-05-26 03:07:42.369323','3','Schedule: Human Computer Interaction 1 (First 2025-05-26), D-204, 11:07:15 - 12:07:16',1,'[{\"added\": {}}]',11,1),(96,'2025-05-26 03:09:14.743343','3','1 (2) - BSIT - Bachelors of Science in Information Technology',1,'[{\"added\": {}}]',18,1),(97,'2025-05-26 03:21:47.847012','3','Section 1 (2) - BSIT - Bachelors of Science in Information Technology',2,'[{\"changed\": {\"fields\": [\"Name\"]}}]',18,1),(98,'2025-05-27 02:18:38.202214','2','Evaluation #2 on 2025-05-27',1,'[{\"added\": {}}]',13,1),(99,'2025-05-27 02:18:48.303604','2','Evaluation #2 on 2025-05-27',2,'[{\"changed\": {\"fields\": [\"Instructor\"]}}]',13,1),(100,'2025-05-27 02:29:30.280796','2','Evaluation #2 on 2025-05-27',3,'',13,1),(101,'2025-05-27 02:29:34.174821','2','Evaluation #2 on 2025-05-27',3,'',13,1),(102,'2025-05-27 02:30:11.117863','2','Evaluation #2 on 2025-05-27',3,'',13,1),(103,'2025-05-28 02:40:51.262953','1','BSIT - Bachelors of Science in Information Technology - BSIT',1,'[{\"added\": {}}]',24,1),(104,'2025-05-28 07:45:30.195255','7','Renzo\'s room (Inactive)',3,'',7,1),(105,'2025-05-28 09:09:04.573204','1','BSIT - Bachelors of Science in Information Technology - BSIT',2,'[{\"added\": {\"name\": \"program professor\", \"object\": \"romdeo.sjc@phinmaed.com - BSIT - Bachelors of Science in Information Technology - BSIT\"}}]',24,1),(106,'2025-05-29 07:13:07.240802','1','BSIT - Bachelors of Science in Information Technology - BSIT',2,'[{\"added\": {\"name\": \"program professor\", \"object\": \"rjdaw.sjc@phinmaed.com - BSIT - Bachelors of Science in Information Technology - BSIT\"}}]',24,1),(107,'2025-05-29 07:15:08.616835','4','2025',1,'[{\"added\": {}}]',11,1),(108,'2025-06-10 07:14:53.652662','4','2025',2,'[{\"changed\": {\"fields\": [\"Instructor\"]}}]',11,1),(109,'2025-06-10 07:15:02.973392','3','2025',2,'[{\"changed\": {\"fields\": [\"Instructor\"]}}]',11,1),(110,'2025-06-10 07:15:07.906334','2','2025',2,'[{\"changed\": {\"fields\": [\"Instructor\"]}}]',11,1),(111,'2025-06-10 07:15:36.463856','3','2025',2,'[{\"changed\": {\"fields\": [\"Instructor\"]}}]',11,1),(112,'2025-06-10 07:16:16.449421','4','romdeo.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(113,'2025-06-10 08:32:27.962457','4','Evaluation #4 on 2025-06-10',3,'',13,1),(114,'2025-06-10 08:32:30.570627','3','Evaluation #3 on 2025-06-10',3,'',13,1),(115,'2025-06-11 09:41:00.178339','2','2025',2,'[{\"changed\": {\"fields\": [\"Program\"]}}]',11,1),(116,'2025-06-13 00:47:52.905643','7','Evaluation #7 on 2025-06-13',3,'',13,1),(117,'2025-06-13 00:47:56.380992','5','Evaluation #5 on 2025-06-10',3,'',13,1),(118,'2025-06-13 00:47:59.068738','6','Evaluation #6 on 2025-06-11',3,'',13,1),(119,'2025-06-16 01:56:26.776248','17','maor.espineda.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',10,1),(120,'2025-06-16 01:56:31.434606','17','maor.espineda.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(121,'2025-06-16 01:56:55.509682','17','maor.espineda.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(122,'2025-06-16 02:06:44.944973','4','2025',2,'[]',11,1),(123,'2025-06-16 02:08:11.875832','4','2025',2,'[]',11,1),(124,'2025-06-16 02:08:23.708335','4','2025',2,'[{\"changed\": {\"fields\": [\"Name\"]}}]',11,1),(125,'2025-06-16 02:09:14.761455','8','Networking I (Active)',1,'[{\"added\": {}}]',9,1),(126,'2025-06-16 02:09:45.046028','7','Computer Programming II (Active)',2,'[{\"changed\": {\"fields\": [\"Name\", \"Slug\"]}}]',9,1),(127,'2025-06-16 02:11:54.511904','9','Information Assurance and Security I (Active)',1,'[{\"added\": {}}]',9,1),(128,'2025-06-16 02:12:32.448622','10','Information Management (Active)',1,'[{\"added\": {}}]',9,1),(129,'2025-06-16 02:12:55.220146','11','Data Structures and Algorithims (Active)',1,'[{\"added\": {}}]',9,1),(130,'2025-06-16 02:13:53.519079','8','Computer Laboratory - 3 (Active)',1,'[{\"added\": {}}]',7,1),(131,'2025-06-16 02:13:58.457834','4','Comlab - 2 (Active)',2,'[]',7,1),(132,'2025-06-16 02:14:16.441691','9','Dimasalang - 404 (Active)',1,'[{\"added\": {}}]',7,1),(133,'2025-06-16 02:14:30.757411','10','Dimasalang - 203 (Active)',1,'[{\"added\": {}}]',7,1),(134,'2025-06-16 02:15:11.617802','4','Section object (4)',1,'[{\"added\": {}}]',18,1),(135,'2025-06-16 02:16:07.853475','7','HazelDulay@phinmaed.com',2,'[]',10,1),(136,'2025-06-16 02:51:28.805394','9','Evaluation #9 on 2025-06-16',3,'',13,1),(137,'2025-06-16 02:51:34.374236','8','Evaluation #8 on 2025-06-13',2,'[]',13,1),(138,'2025-06-16 03:46:46.853247','24','Marc.sjc@phinmaed.ocm',1,'[{\"added\": {}}]',10,1),(139,'2025-06-16 03:46:59.524951','24','Marc.sjc@phinmaed.ocm',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(140,'2025-06-16 03:47:22.520870','1','BSIT - Bachelors of Science in Information Technology - BSIT',2,'[{\"added\": {\"name\": \"program professor\", \"object\": \"Marc.sjc@phinmaed.ocm - BSIT - Bachelors of Science in Information Technology - BSIT\"}}]',24,1),(141,'2025-06-16 07:52:50.019570','13','Evaluation #13 on 2025-06-16',3,'',13,1),(142,'2025-06-16 07:52:54.357806','12','Evaluation #12 on 2025-06-16',3,'',13,1),(143,'2025-06-17 03:40:01.957173','1','espinedamartin14@yahoo.com',2,'[]',10,1),(144,'2025-06-17 07:16:15.683653','15','Evaluation #15 on 2025-06-17',3,'',13,1),(145,'2025-06-17 07:16:19.058695','14','Evaluation #14 on 2025-06-17',3,'',13,1),(146,'2025-06-18 02:57:48.792722','17','Evaluation #17 on 2025-06-17',3,'',13,1),(147,'2025-06-18 02:58:08.997550','16','Evaluation #16 on 2025-06-17',3,'',13,1),(148,'2025-06-18 04:19:57.407641','11','Evaluation #11 on 2025-06-16',3,'',13,1),(149,'2025-06-18 04:25:31.015853','19','Evaluation #19 on 2025-06-18',3,'',13,1),(150,'2025-06-18 04:25:33.702845','18','Evaluation #18 on 2025-06-18',3,'',13,1),(151,'2025-06-18 04:28:57.503365','3','2025',2,'[{\"changed\": {\"fields\": [\"Program\"]}}]',11,1),(152,'2025-06-18 05:18:07.607704','22','Evaluation #22 on 2025-06-18',3,'',13,1),(153,'2025-06-18 05:18:12.778542','21','Evaluation #21 on 2025-06-20',3,'',13,1),(154,'2025-06-18 05:18:16.986011','20','Evaluation #20 on 2025-06-19',3,'',13,1),(155,'2025-06-18 07:51:33.540127','5','Section object (5)',1,'[{\"added\": {}}]',18,1),(156,'2025-06-18 07:51:41.118263','5','Section object (5)',3,'',18,1),(157,'2025-06-18 07:51:59.088425','6','Section object (6)',1,'[{\"added\": {}}]',18,1),(158,'2025-06-18 07:56:55.543183','6','Section object (6)',3,'',18,1),(159,'2025-06-18 07:57:25.168922','7','Section object (7)',1,'[{\"added\": {}}]',18,1),(160,'2025-06-18 09:21:26.251155','7','Section object (7)',3,'',18,1),(161,'2025-06-18 09:21:28.864864','4','Section object (4)',3,'',18,1),(162,'2025-06-18 09:21:53.664465','3','Section object (3)',2,'[{\"changed\": {\"fields\": [\"Program\"]}}]',18,1),(163,'2025-06-18 09:21:56.127355','3','Section object (3)',2,'[]',18,1),(164,'2025-06-18 09:22:08.183929','8','Section object (8)',1,'[{\"added\": {}}]',18,1),(165,'2025-06-19 02:02:14.213994','3','Section object (3)',3,'',18,1),(166,'2025-06-19 02:02:16.927082','8','Section object (8)',3,'',18,1),(167,'2025-06-19 02:02:20.623743','2','Section object (2)',3,'',18,1),(168,'2025-06-19 02:02:23.306067','1','Section object (1)',3,'',18,1),(169,'2025-06-19 02:09:04.805708','9','Section object (9)',1,'[{\"added\": {}}]',18,1),(170,'2025-06-19 02:09:26.660295','9','Section object (9)',2,'[]',18,1),(171,'2025-06-19 02:09:40.945813','10','Section object (10)',1,'[{\"added\": {}}]',18,1),(172,'2025-06-19 02:09:53.624814','11','Section object (11)',1,'[{\"added\": {}}]',18,1),(173,'2025-06-19 02:09:57.863784','11','Section object (11)',2,'[{\"changed\": {\"fields\": [\"Program\"]}}]',18,1),(174,'2025-06-19 03:18:51.984090','11','Section object (11)',2,'[]',18,1),(175,'2025-06-19 03:18:57.466936','11','Section object (11)',3,'',18,1),(176,'2025-06-19 03:19:10.434661','12','Section object (12)',1,'[{\"added\": {}}]',18,1),(177,'2025-06-19 03:34:43.751577','1','BSIT - Bachelors of Science in Information Technology - None',2,'[{\"changed\": {\"fields\": [\"Slug\", \"Code\"]}}]',24,1),(178,'2025-06-19 04:50:44.049858','9','Section object (9)',3,'',18,1),(179,'2025-06-19 04:50:47.043347','10','Section object (10)',3,'',18,1),(180,'2025-06-19 04:51:01.363754','13','Section object (13)',1,'[{\"added\": {}}]',18,1),(181,'2025-06-19 04:51:56.953083','13','Section object (13)',2,'[{\"changed\": {\"fields\": [\"Name\", \"Slug\"]}}]',18,1),(182,'2025-06-19 04:52:07.005235','14','Section object (14)',1,'[{\"added\": {}}]',18,1),(183,'2025-06-19 04:53:29.449965','5','2025',1,'[{\"added\": {}}]',11,1),(184,'2025-06-19 05:31:35.065937','25','Evaluation #25 on 2025-06-21',3,'',13,1),(185,'2025-06-19 05:31:40.756463','24','Evaluation #24 on 2025-06-19',3,'',13,1),(186,'2025-06-19 05:39:29.528314','28','Evaluation #28 on 2025-06-19',3,'',13,1),(187,'2025-06-19 05:39:33.276734','27','Evaluation #27 on 2025-06-19',3,'',13,1),(188,'2025-06-19 05:39:36.108852','26','Evaluation #26 on 2025-06-19',3,'',13,1),(189,'2025-06-19 05:49:20.134991','31','Evaluation #31 on 2025-06-19',3,'',13,1),(190,'2025-06-19 05:49:23.056476','30','Evaluation #30 on 2025-06-19',3,'',13,1),(191,'2025-06-19 05:49:25.063282','29','Evaluation #29 on 2025-06-19',3,'',13,1),(192,'2025-06-19 06:47:29.225551','34','Evaluation #34 on 2025-06-19',3,'',13,1),(193,'2025-06-19 06:47:31.425406','33','Evaluation #33 on 2025-06-19',3,'',13,1),(194,'2025-06-19 06:47:33.514651','32','Evaluation #32 on 2025-06-19',3,'',13,1),(195,'2025-06-19 07:25:38.493804','37','Evaluation #37 on 2025-06-19',3,'',13,1),(196,'2025-06-19 07:31:19.454371','38','Evaluation #38 on 2025-06-19',3,'',13,1),(197,'2025-06-19 07:33:50.088313','39','Evaluation #39 on 2025-06-19',3,'',13,1),(198,'2025-06-19 07:39:50.975067','40','Evaluation #40 on 2025-06-19',3,'',13,1),(199,'2025-06-19 07:40:54.228476','41','Evaluation #41 on 2025-06-19',3,'',13,1),(200,'2025-06-19 07:54:30.075225','42','Evaluation #42 on 2025-06-19',3,'',13,1),(201,'2025-06-19 07:58:02.627984','43','Evaluation #43 on 2025-06-19',3,'',13,1),(202,'2025-06-19 08:05:30.105748','44','Evaluation #44 on 2025-06-19',3,'',13,1),(203,'2025-06-20 04:22:03.470080','14','Section object (14)',2,'[{\"changed\": {\"fields\": [\"Name\"]}}]',18,1),(204,'2025-06-20 05:28:44.622003','12','Section object (12)',2,'[{\"changed\": {\"fields\": [\"Name\"]}}]',18,1),(205,'2025-06-20 05:29:00.099858','15','Section object (15)',1,'[{\"added\": {}}]',18,1),(206,'2025-06-23 07:24:47.738018','46','Evaluation #46 on 2025-06-23',3,'',13,1),(207,'2025-06-23 07:24:51.841523','45','Evaluation #45 on 2025-06-19',3,'',13,1),(208,'2025-06-23 07:24:56.394808','36','Evaluation #36 on 2025-06-19',3,'',13,1),(209,'2025-06-23 07:25:00.093554','35','Evaluation #35 on 2025-06-19',3,'',13,1),(210,'2025-06-23 08:58:38.136526','48','Evaluation #48 on 2025-06-23',3,'',13,1),(211,'2025-06-23 08:58:40.822901','47','Evaluation #47 on 2025-06-23',3,'',13,1),(212,'2025-06-25 05:09:01.696616','53','Evaluation #53 on 2025-06-25',3,'',13,1),(213,'2025-06-25 05:09:06.624456','52','Evaluation #52 on 2025-06-25',3,'',13,1),(214,'2025-06-25 05:09:09.744498','51','Evaluation #51 on 2025-06-25',3,'',13,1),(215,'2025-06-25 05:09:13.739114','50','Evaluation #50 on 2025-06-23',3,'',13,1),(216,'2025-06-25 05:36:49.513766','1','SFF - For Networking - SFF FEEDBACK STUDENT',3,'',8,1),(217,'2025-06-25 05:36:52.358546','2','SFF FOR JAZEL ALIM - SFF FOR JAZEL ALIM',3,'',8,1),(218,'2025-06-25 05:58:33.669471','2','alimjazel14@gmail.com',3,'',10,1),(219,'2025-06-25 06:02:03.187868','17','maor.espineda.sjc@phinmaed.com',3,'',10,1),(220,'2025-06-25 06:16:59.079190','8','Section 1 BSIT - Bachelors of Science in Information Technology - 1st Year - Intelligent Systems - 1',3,'',11,1),(221,'2025-06-25 06:17:02.153979','7','Section 3 BSIT - Bachelors of Science in Information Technology - 1st Year - Computer Programming I',3,'',11,1),(222,'2025-06-25 06:17:05.499463','6','Section 3 BSIT - Bachelors of Science in Information Technology - 1st Year - Networking II - 1',3,'',11,1),(223,'2025-06-25 06:17:07.554234','5','Section 1 BSIT - Bachelors of Science in Information Technology - 1st Year - Networking II - 1',3,'',11,1),(224,'2025-06-25 07:56:31.630357','15','Section object (15)',2,'[{\"changed\": {\"fields\": [\"Students\"]}}]',18,1),(225,'2025-06-25 07:56:38.412910','14','Section object (14)',2,'[{\"changed\": {\"fields\": [\"Students\"]}}]',18,1),(226,'2025-06-25 07:56:45.323830','13','Section object (13)',2,'[{\"changed\": {\"fields\": [\"Students\"]}}]',18,1),(227,'2025-06-25 07:56:51.736411','12','Section object (12)',2,'[{\"changed\": {\"fields\": [\"Students\"]}}]',18,1),(228,'2025-06-26 02:34:56.572986','7','Student Evaluation: Francisco Dawal - Networking I (Active) - ',3,'',8,1),(229,'2025-06-26 02:34:59.417922','6','Student Evaluation: Francisco Dawal - Networking II (Inactive) - ',3,'',8,1),(230,'2025-06-26 02:35:05.931807','14','sample question2 - MCQ ',3,'',14,1),(231,'2025-06-26 02:35:09.469576','13','sample question - RATING ',3,'',14,1),(232,'2025-06-26 02:35:13.378480','12','This is a comment sample - TEXT ',3,'',14,1),(233,'2025-06-26 02:35:16.791527','11','This is a rating scale sample - RATING ',3,'',14,1),(234,'2025-06-26 02:35:19.658559','10','This is a MCQ sample - MCQ ',3,'',14,1),(235,'2025-06-26 07:46:29.382809','3','WAS THIS PROF HELPFUL TO YOUR STUDY JOURNEY - MCQ ',3,'',14,1),(236,'2025-06-26 07:46:33.139615','2','RATE THIS PROF FROM 1 - 10 - RATING ',3,'',14,1),(237,'2025-06-26 07:46:36.643392','1','WHAT IS YOUR COMMENT TO THIS PROF - TEXT ',3,'',14,1),(238,'2025-06-26 11:42:53.641075','9','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking II (Inactive) - ',2,'[{\"changed\": {\"fields\": [\"Import questions\"]}}]',8,1),(239,'2025-06-26 11:43:01.524957','9','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking II (Inactive) - ',2,'[{\"changed\": {\"fields\": [\"Import questions\"]}}]',8,1),(240,'2025-06-27 06:48:38.809306','18','MCQ FRIDAY SAMPLE - MCQ ',3,'',14,1),(241,'2025-06-27 06:48:56.037254','10','Student Evaluation: Francisco Dawal - Networking I (Active) - ',3,'',8,1),(242,'2025-06-27 08:16:51.467495','20','MCQ FRIDAY SAMPLE 2 - MCQ ',3,'',14,1),(243,'2025-06-27 08:16:53.556597','19','MCQ FRIDAY SAMPLE - MCQ ',3,'',14,1),(244,'2025-06-27 08:16:55.679324','17','sample added question to import mcq - MCQ ',3,'',14,1),(245,'2025-06-27 08:16:57.791992','16','TRY - MCQ ',3,'',14,1),(246,'2025-06-27 08:17:00.610495','15','sa - MCQ ',3,'',14,1),(247,'2025-06-27 08:17:02.573020','9','This is a rating scale sample - RATING ',3,'',14,1),(248,'2025-06-27 08:17:04.807387','8','This is a MCQ sample - MCQ ',3,'',14,1),(249,'2025-06-27 08:17:06.855608','7','This is a rating scale sample - RATING ',3,'',14,1),(250,'2025-06-27 08:17:09.314343','6','This is a MCQ sample - MCQ ',3,'',14,1),(251,'2025-06-27 08:17:11.692158','5','This is a rating scale sample - RATING ',3,'',14,1),(252,'2025-06-27 08:17:14.469101','4','This is a MCQ sample - MCQ ',3,'',14,1),(253,'2025-06-27 08:17:22.458876','13','Student Evaluation: Francisco Dawal - Networking I (Active) - SAMPLE FRIDAY 2',3,'',8,1),(254,'2025-06-27 08:17:25.493778','12','Student Evaluation: Francisco Dawal - Networking I (Active) - SAMPLE FRIDAY!!!',3,'',8,1),(255,'2025-06-27 08:17:28.178146','11','Student Evaluation: Francisco Dawal - Networking I (Active) - ',3,'',8,1),(256,'2025-06-27 08:17:30.524393','9','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking II (Inactive) - ',3,'',8,1),(257,'2025-06-27 08:17:33.510478','8','Student Evaluation: Francisco Dawal - Networking I (Active) - ',3,'',8,1),(258,'2025-06-27 08:17:41.637199','5','Student Evaluation: Francisco Dawal - Networking II (Inactive) - ',3,'',8,1),(259,'2025-06-27 08:17:43.922600','4','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking II (Inactive) - ',3,'',8,1),(260,'2025-06-27 08:17:46.440804','3','Student Evaluation: Francisco Dawal - Networking II (Inactive) - ',3,'',8,1),(261,'2025-06-30 02:00:30.968502','24','CREATE DIALOG CREATE QUESTION SAMPLE 1 RS - RATING ',3,'',14,1),(262,'2025-06-30 02:00:35.952076','23','CREATE DIALOG CREATE QUESTION SAMPLE 1 COM BOX - TEXT ',3,'',14,1),(263,'2025-06-30 02:00:38.589993','26','CREATE DIALOG CREATE QUESTION SAMPLE 1 COM BOX - TEXT ',3,'',14,1),(264,'2025-06-30 02:00:41.775376','25','CREATE DIALOG CREATE QUESTION SAMPLE 1 MCQ - MCQ ',3,'',14,1),(265,'2025-06-30 02:00:44.497664','27','CREATE DIALOG CREATE QUESTION SAMPLE 1 RS - RATING ',3,'',14,1),(266,'2025-06-30 02:00:47.161751','28','CREATE DIALOG CREATE QUESTION SAMPLE 1 MCQ - MCQ ',3,'',14,1),(267,'2025-06-30 02:00:51.125621','30','CREATE DIALOG CREATE QUESTION SAMPLE 1 RS - RATING ',3,'',14,1),(268,'2025-06-30 02:00:54.235751','31','CREATE DIALOG CREATE QUESTION SAMPLE 1 MCQ - MCQ ',3,'',14,1),(269,'2025-06-30 02:00:56.697592','32','CREATE DIALOG CREATE QUESTION SAMPLE 1 COM BOX - TEXT ',3,'',14,1),(270,'2025-06-30 06:19:20.152993','14','Student Evaluation: Francisco Dawal - Networking I (Active) - CREATE DIALOG STUD EVAL AND QUEST SAMPLE 1',2,'[{\"changed\": {\"fields\": [\"Import questions\"]}}]',8,1),(271,'2025-07-01 01:34:48.399011','37','MONDAY JUNE 30 SAMPLE 3 FOR QUESTION, USING CREATE DIALOG MCQ 1 - MCQ ',3,'',14,1),(272,'2025-07-01 01:34:51.639794','36','CREATE DIALOG CREATE QUESTION SAMPLE 1 COM BOX - TEXT ',3,'',14,1),(273,'2025-07-01 01:34:54.667522','35','CREATE DIALOG CREATE QUESTION SAMPLE 1 MCQ - MCQ ',3,'',14,1),(274,'2025-07-01 01:35:00.007993','34','CREATE DIALOG CREATE QUESTION SAMPLE 1 RS - RATING ',3,'',14,1),(275,'2025-07-01 01:35:03.212546','29','CREATE DIALOG CREATE QUESTION SAMPLE 1 COM BOX - TEXT ',3,'',14,1),(276,'2025-07-01 01:35:05.943964','33','CREATE DIALOG CREATE QUESTION SAMPLE 1 RS - RATING ',3,'',14,1),(277,'2025-07-01 01:35:09.806437','22','CREATE DIALOG CREATE QUESTION SAMPLE 1 MCQ - MCQ ',3,'',14,1),(278,'2025-07-01 01:35:14.143355','21','CREATE DIALOG CREATE QUESTION SAMPLE 1 RS - RATING ',3,'',14,1),(279,'2025-07-01 01:35:19.674816','18','Student Evaluation: Francisco Dawal - Computer Programming II (Active) - RAM BAGONG UPDATE OF CODE',3,'',8,1),(280,'2025-07-01 01:35:23.174227','17','Student Evaluation: Francisco Dawal - Intelligent Systems (Active) - ',3,'',8,1),(281,'2025-07-01 01:35:27.115240','16','Student Evaluation: Francisco Dawal - Computer Programming I (Active) - MONDAY JUNE 30 SAMPLE 2',3,'',8,1),(282,'2025-07-01 01:35:30.483516','15','Student Evaluation: Francisco Dawal - Networking II (Inactive) - JUNE 30 MONDAY SAMPLE IN CREATE DIALOG',3,'',8,1),(283,'2025-07-01 01:35:33.243384','14','Student Evaluation: Francisco Dawal - Networking I (Active) - CREATE DIALOG STUD EVAL AND QUEST SAMPLE 1',3,'',8,1),(284,'2025-07-01 09:06:15.027039','26','Lau.Pasana.sjc@phinmaed.com',1,'[{\"added\": {}}]',10,1),(285,'2025-07-01 09:06:20.460462','26','Lau.Pasana.sjc@phinmaed.com',2,'[]',10,1),(286,'2025-07-01 09:08:38.286044','27','Tej.Denver.sjc@phinmaed.com',1,'[{\"added\": {}}]',10,1),(287,'2025-07-01 09:08:42.786472','27','Tej.Denver.sjc@phinmaed.com',2,'[]',10,1),(288,'2025-07-01 09:09:56.935625','14','Section 1 BSIT - Bachelors of Science in Information Technology - 1st Year - Data Structures and Algorithims - 1',1,'[{\"added\": {}}]',11,1),(289,'2025-07-01 09:18:49.669620','14','Section 4 BSIT - Bachelors of Science in Information Technology - None - Data Structures and Algorithims - 1',2,'[{\"changed\": {\"fields\": [\"Section\"]}}]',11,1),(290,'2025-07-01 09:18:54.279078','13','Section 4 BSIT - Bachelors of Science in Information Technology - None - Intelligent Systems - 1',2,'[{\"changed\": {\"fields\": [\"Section\"]}}]',11,1),(291,'2025-07-01 09:18:57.387640','12','Section 4 BSIT - Bachelors of Science in Information Technology - None - Computer Programming II - 1',2,'[{\"changed\": {\"fields\": [\"Section\"]}}]',11,1),(292,'2025-07-01 09:19:01.697113','11','Section 4 BSIT - Bachelors of Science in Information Technology - None - Computer Programming I - 1',2,'[{\"changed\": {\"fields\": [\"Section\"]}}]',11,1),(293,'2025-07-01 09:19:06.062761','10','Section 4 BSIT - Bachelors of Science in Information Technology - None - Networking II - 1',2,'[{\"changed\": {\"fields\": [\"Section\"]}}]',11,1),(294,'2025-07-01 09:19:09.895793','9','Section 4 BSIT - Bachelors of Science in Information Technology - None - Networking I - 1',2,'[{\"changed\": {\"fields\": [\"Section\"]}}]',11,1),(295,'2025-07-02 08:32:26.189525','15','Section 4 BSIT - Bachelors of Science in Information Technology - None',2,'[]',18,1),(296,'2025-07-04 04:00:02.498422','19','Student Evaluation: Francisco Dawal - Networking I (Active) - JULY 1 TUESDAY SAMPLE 1 CREATE DIALOG CREATE QUEST',3,'',8,1),(297,'2025-07-04 05:36:56.654849','5','Student Evaluation: Francisco Dawal - Intelligent Systems (Active) - INTEL SYS JULY 2 - maor.espineda.sjc@phinmaed.com - A ',3,'',15,1),(298,'2025-07-04 05:36:58.758734','4','None - maor.espineda.sjc@phinmaed.com - 1 ',3,'',15,1),(299,'2025-07-04 05:37:01.194393','3','None - maor.espineda.sjc@phinmaed.com - T ',3,'',15,1),(300,'2025-07-04 05:37:04.255689','2','Student Evaluation: Francisco Dawal - Networking II (Inactive) - NEW TUESDAY JULY 1 FOR IMPORTING PRACTICE - maor.espineda.sjc@phinmaed.com - 5 ',3,'',15,1),(301,'2025-07-04 05:37:06.752453','1','Student Evaluation: Francisco Dawal - Networking II (Inactive) - NEW TUESDAY JULY 1 FOR IMPORTING PRACTICE - maor.espineda.sjc@phinmaed.com - 2 ',3,'',15,1),(302,'2025-07-04 06:42:54.801679','14','Student Evaluation: Francisco Dawal - Intelligent Systems (Active) - INTEL SYS JULY 2 - maor.espineda.sjc@phinmaed.com - B ',3,'',15,1),(303,'2025-07-04 06:42:59.277055','13','Student Evaluation: Francisco Dawal - Networking II (Inactive) - NEW TUESDAY JULY 1 FOR IMPORTING PRACTICE - maor.espineda.sjc@phinmaed.com - 5 ',3,'',15,1),(304,'2025-07-04 06:43:03.600701','12','Student Evaluation: Francisco Dawal - Networking II (Inactive) - NEW TUESDAY JULY 1 FOR IMPORTING PRACTICE - maor.espineda.sjc@phinmaed.com - T ',3,'',15,1),(305,'2025-07-04 06:43:05.940728','11','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking I (Active) - CREATE DIALOG CREATE AND IMPORT QUESTION - maor.espineda.sjc@phinmaed.com - 5 ',3,'',15,1),(306,'2025-07-04 06:43:08.189297','10','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking I (Active) - CREATE DIALOG CREATE AND IMPORT QUESTION - maor.espineda.sjc@phinmaed.com - PAGOD NA KO ',3,'',15,1),(307,'2025-07-04 06:43:10.485680','9','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking I (Active) - CREATE DIALOG CREATE AND IMPORT QUESTION - maor.espineda.sjc@phinmaed.com - sample answ ',3,'',15,1),(308,'2025-07-04 06:43:12.685893','8','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking I (Active) - CREATE DIALOG CREATE AND IMPORT QUESTION - maor.espineda.sjc@phinmaed.com - B ',3,'',15,1),(309,'2025-07-04 06:43:14.845684','7','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking I (Active) - CREATE DIALOG CREATE AND IMPORT QUESTION - maor.espineda.sjc@phinmaed.com - 5 ',3,'',15,1),(310,'2025-07-04 06:43:17.173883','6','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking I (Active) - CREATE DIALOG CREATE AND IMPORT QUESTION - maor.espineda.sjc@phinmaed.com - T ',3,'',15,1),(311,'2025-07-04 08:06:16.783670','17','Student Evaluation: Francisco Dawal - Intelligent Systems (Active) - INTEL SYS JULY 2 - maor.espineda.sjc@phinmaed.com - A ',3,'',15,1),(312,'2025-07-04 08:06:19.367572','23','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking I (Active) - CREATE DIALOG CREATE AND IMPORT QUESTION - maor.espineda.sjc@phinmaed.com - 5 ',3,'',15,1),(313,'2025-07-04 08:06:22.483981','22','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking I (Active) - CREATE DIALOG CREATE AND IMPORT QUESTION - maor.espineda.sjc@phinmaed.com - AYOKO NA ',3,'',15,1),(314,'2025-07-04 08:06:24.599703','21','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking I (Active) - CREATE DIALOG CREATE AND IMPORT QUESTION - maor.espineda.sjc@phinmaed.com - JONAS NIGGER ',3,'',15,1),(315,'2025-07-04 08:06:26.884500','20','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking I (Active) - CREATE DIALOG CREATE AND IMPORT QUESTION - maor.espineda.sjc@phinmaed.com - A ',3,'',15,1),(316,'2025-07-04 08:06:29.853739','19','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking I (Active) - CREATE DIALOG CREATE AND IMPORT QUESTION - maor.espineda.sjc@phinmaed.com - 5 ',3,'',15,1),(317,'2025-07-04 08:06:33.165520','18','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking I (Active) - CREATE DIALOG CREATE AND IMPORT QUESTION - maor.espineda.sjc@phinmaed.com - T ',3,'',15,1),(318,'2025-07-04 08:06:35.329101','16','Student Evaluation: Francisco Dawal - Networking II (Inactive) - NEW TUESDAY JULY 1 FOR IMPORTING PRACTICE - maor.espineda.sjc@phinmaed.com - 5 ',3,'',15,1),(319,'2025-07-04 08:06:37.558406','15','Student Evaluation: Francisco Dawal - Networking II (Inactive) - NEW TUESDAY JULY 1 FOR IMPORTING PRACTICE - maor.espineda.sjc@phinmaed.com - T ',3,'',15,1),(320,'2025-07-07 01:33:57.549699','26','Student Evaluation: Francisco Dawal - Intelligent Systems (Active) - INTEL SYS JULY 2 - maor.espineda.sjc@phinmaed.com -  ',3,'',15,1),(321,'2025-07-07 01:33:59.555270','25','Student Evaluation: Francisco Dawal - Networking II (Inactive) - NEW TUESDAY JULY 1 FOR IMPORTING PRACTICE - maor.espineda.sjc@phinmaed.com - 5 ',3,'',15,1),(322,'2025-07-07 01:34:01.454689','24','Student Evaluation: Francisco Dawal - Networking II (Inactive) - NEW TUESDAY JULY 1 FOR IMPORTING PRACTICE - maor.espineda.sjc@phinmaed.com - 2 ',3,'',15,1),(323,'2025-07-07 01:47:17.023704','29','Student Evaluation: Francisco Dawal - Intelligent Systems (Active) - INTEL SYS JULY 2 - maor.espineda.sjc@phinmaed.com - B ',3,'',15,1),(324,'2025-07-07 01:47:20.577115','28','Student Evaluation: Francisco Dawal - Networking II (Inactive) - NEW TUESDAY JULY 1 FOR IMPORTING PRACTICE - maor.espineda.sjc@phinmaed.com - 5 ',3,'',15,1),(325,'2025-07-07 01:47:23.734776','27','Student Evaluation: Francisco Dawal - Networking II (Inactive) - NEW TUESDAY JULY 1 FOR IMPORTING PRACTICE - maor.espineda.sjc@phinmaed.com - T ',3,'',15,1),(326,'2025-07-07 05:49:41.217184','32','Student Evaluation: Francisco Dawal - Networking II (Inactive) - NEW TUESDAY JULY 1 FOR IMPORTING PRACTICE - maor.espineda.sjc@phinmaed.com - 5 ',3,'',15,1),(327,'2025-07-07 05:49:43.796120','31','Student Evaluation: Francisco Dawal - Networking II (Inactive) - NEW TUESDAY JULY 1 FOR IMPORTING PRACTICE - maor.espineda.sjc@phinmaed.com - T ',3,'',15,1),(328,'2025-07-07 05:49:46.874177','30','Student Evaluation: Francisco Dawal - Intelligent Systems (Active) - INTEL SYS JULY 2 - maor.espineda.sjc@phinmaed.com - B ',3,'',15,1),(329,'2025-07-07 05:52:00.160015','33','Student Evaluation: Francisco Dawal - Intelligent Systems (Active) - INTEL SYS JULY 2 - maor.espineda.sjc@phinmaed.com - B ',3,'',15,1),(330,'2025-07-08 06:33:09.713002','1','CITE - College of Information  Technology Education',1,'[{\"added\": {}}]',27,1),(331,'2025-07-08 06:43:47.699449','40','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking I (Active) - CREATE DIALOG CREATE AND IMPORT QUESTION - maor.espineda.sjc@phinmaed.com - 5 ',3,'',15,1),(332,'2025-07-08 06:43:49.977637','39','Student Evaluation: rjdaw.sjc@phinmaed.com - Networking I (Active) - CREATE DIALOG CREATE AND IMPORT QUESTION - maor.espineda.sjc@phinmaed.com - PAGOD NA KO ',3,'',15,1),(333,'2025-07-08 07:15:37.504872','25','maor.espineda.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,1),(334,'2025-07-10 06:03:03.714112','1','CITE - College of Information  Technology Education',2,'[{\"changed\": {\"fields\": [\"Evaluations\", \"Student evaluations\"]}}]',27,1),(335,'2025-07-10 06:27:57.416261','1','CITE - College of Information  Technology Education',2,'[{\"changed\": {\"fields\": [\"Dean\"]}}]',27,1),(336,'2025-07-10 08:28:08.430049','5','BSCS - Bachelor of Science in Computer Science - None',2,'[{\"changed\": {\"fields\": [\"Faculty\"]}}]',24,1),(337,'2025-07-10 08:28:13.260716','1','BSIT - Bachelors of Science in Information Technology - None',2,'[{\"changed\": {\"fields\": [\"Faculty\"]}}]',24,1),(338,'2025-07-10 08:29:55.305577','5','BSCS - Bachelor of Science in Computer Science - None',2,'[{\"added\": {\"name\": \"program professor\", \"object\": \"espinedamartin14@yahoo.com - BSCS - Bachelor of Science in Computer Science - None\"}}]',24,1),(339,'2025-07-10 08:30:10.576626','1','BSIT - Bachelors of Science in Information Technology - None',2,'[{\"added\": {\"name\": \"program professor\", \"object\": \"espinedamartin14@yahoo.com - BSIT - Bachelors of Science in Information Technology - None\"}}]',24,1),(340,'2025-07-10 08:37:54.726044','2','CAAS - College of Arts and Sciences',1,'[{\"added\": {}}]',27,1),(341,'2025-07-10 08:41:14.084272','2','BSED - Bachelors of Science in Education - Major in Filipino - None',2,'[{\"changed\": {\"fields\": [\"Name\"]}}]',24,1),(342,'2025-07-10 08:42:04.955513','3','COED - College of Education',1,'[{\"added\": {}}]',27,1),(343,'2025-07-10 08:43:43.515808','2','BSED - Bachelors of Science in Education - Major in Filipino - None',2,'[{\"changed\": {\"fields\": [\"Faculty\"]}}]',24,1),(344,'2025-07-10 09:14:54.250363','1','espinedamartin14@yahoo.com',2,'[{\"changed\": {\"fields\": [\"Superuser status\"]}}]',10,1),(345,'2025-07-11 02:37:24.625975','25','maor.espineda.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Staff status\", \"Superuser status\"]}}]',10,30),(346,'2025-07-11 02:38:54.351787','5','BSCS - Bachelor of Science in Computer Science - None',2,'[{\"added\": {\"name\": \"program professor\", \"object\": \"rjdaw.sjc@phinmaed.com - BSCS - Bachelor of Science in Computer Science - None\"}}, {\"changed\": {\"name\": \"program professor\", \"object\": \"Tej.Denver.sjc@phinmaed.com - BSCS - Bachelor of Science in Computer Science - None\", \"fields\": [\"Professor\"]}}]',24,30),(347,'2025-07-11 05:00:32.948280','56','Evaluation #56 on 2025-07-11',3,'',13,30),(348,'2025-07-11 05:00:35.983358','57','Evaluation #57 on 2025-07-11',3,'',13,30),(349,'2025-07-11 05:00:44.175973','55','Evaluation #55 on 2025-07-08',3,'',13,30),(350,'2025-07-11 05:00:48.062556','54','Evaluation #54 on 2025-06-25',3,'',13,30),(351,'2025-07-11 07:33:58.979981','58','Evaluation #58 on 2025-07-11',3,'',13,30),(352,'2025-07-11 07:34:03.028579','60','Evaluation #60 on 2025-07-11',3,'',13,30),(353,'2025-07-11 07:34:05.498057','59','Evaluation #59 on 2025-07-11',3,'',13,30),(354,'2025-07-11 08:35:35.862104','1','espinedamartin14@yahoo.com',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\"]}}]',10,30),(355,'2025-07-11 08:36:01.848584','4','romdeo.sjc@phinmaed.com',2,'[{\"changed\": {\"fields\": [\"Groups\"]}}]',10,30),(356,'2025-07-11 08:36:20.603899','1','CITE - College of Information  Technology Education',2,'[{\"changed\": {\"fields\": [\"Professors\"]}}]',27,30),(357,'2025-07-15 06:23:37.992122','63','Evaluation #63 on 2025-07-11',3,'',13,30),(358,'2025-07-15 06:23:40.127812','62','Evaluation #62 on 2025-07-11',3,'',13,30),(359,'2025-07-15 06:23:42.730614','61','Evaluation #61 on 2025-07-11',3,'',13,30),(360,'2025-07-15 06:42:55.946618','66','Evaluation #66 on 2025-07-15',3,'',13,30),(361,'2025-07-15 06:43:02.579944','65','Evaluation #65 on 2025-07-15',3,'',13,30),(362,'2025-07-15 08:20:15.491743','64','Evaluation #64 on 2025-07-15',3,'',13,30);

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

) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (5,'admin','logentry'),(2,'auth','group'),(1,'auth','permission'),(19,'authtoken','token'),(20,'authtoken','tokenproxy'),(3,'contenttypes','contenttype'),(6,'hrapp','course'),(16,'hrapp','courseprofessor'),(13,'hrapp','evaluation'),(21,'hrapp','evaluationevaluator'),(22,'hrapp','evaluationinstructor'),(27,'hrapp','faculty'),(12,'hrapp','facultyassignment'),(17,'hrapp','facultyschedule'),(24,'hrapp','program'),(25,'hrapp','programprofessor'),(7,'hrapp','room'),(11,'hrapp','schedule'),(18,'hrapp','section'),(8,'hrapp','studentevaluation'),(14,'hrapp','studentevaluationquestion'),(15,'hrapp','studentevaluationresponse'),(9,'hrapp','subject'),(26,'hrapp','timestamp'),(23,'hrapp','token'),(10,'hrapp','user'),(4,'sessions','session');
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

) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
 character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-04-03 04:26:38.301924'),(2,'contenttypes','0002_remove_content_type_name','2025-04-03 04:26:38.364800'),(3,'auth','0001_initial','2025-04-03 04:26:38.537030'),(4,'auth','0002_alter_permission_name_max_length','2025-04-03 04:26:38.568664'),(5,'auth','0003_alter_user_email_max_length','2025-04-03 04:26:38.568664'),(6,'auth','0004_alter_user_username_opts','2025-04-03 04:26:38.584287'),(7,'auth','0005_alter_user_last_login_null','2025-04-03 04:26:38.584287'),(8,'auth','0006_require_contenttypes_0002','2025-04-03 04:26:38.584287'),(9,'auth','0007_alter_validators_add_error_messages','2025-04-03 04:26:38.584287'),(10,'auth','0008_alter_user_username_max_length','2025-04-03 04:26:38.584287'),(11,'auth','0009_alter_user_last_name_max_length','2025-04-03 04:26:38.599908'),(12,'auth','0010_alter_group_name_max_length','2025-04-03 04:26:38.599908'),(13,'auth','0011_update_proxy_permissions','2025-04-03 04:26:38.615530'),(14,'auth','0012_alter_user_first_name_max_length','2025-04-03 04:26:38.615530'),(15,'hrapp','0001_initial','2025-04-03 04:26:39.650488'),(16,'admin','0001_initial','2025-04-03 04:26:39.744609'),(17,'admin','0002_logentry_remove_auto_add','2025-04-03 04:26:39.754116'),(18,'admin','0003_logentry_add_action_flag_choices','2025-04-03 04:26:39.760620'),(19,'hrapp','0002_alter_user_managers','2025-04-03 04:26:39.776244'),(20,'hrapp','0003_customstudentevaluationresponse_and_more','2025-04-03 04:26:39.963978'),(21,'hrapp','0004_delete_customstudentevaluationresponse_and_more','2025-04-03 04:26:39.979603'),(22,'hrapp','0005_remove_user_role_delete_role','2025-04-03 04:26:40.108139'),(23,'hrapp','0006_user_is_deleted','2025-04-03 04:26:40.186134'),(24,'hrapp','0007_alter_user_options_studentevaluation_user_professor_and_more','2025-04-03 04:26:41.362488'),(25,'hrapp','0008_studentevaluation_import_questions_and_more','2025-04-03 04:26:41.487852'),(26,'hrapp','0009_alter_facultyassignment_schedule_and_more','2025-04-03 04:26:41.660468'),(27,'sessions','0001_initial','2025-04-03 04:26:41.676092'),(28,'hrapp','0010_remove_schedule_course_remove_schedule_professor_and_more','2025-04-03 07:52:06.277796'),(29,'hrapp','0011_remove_facultyassignment_schedule_schedule_course_and_more','2025-04-04 05:07:50.912865'),(30,'hrapp','0012_section_year_level','2025-04-04 07:26:04.815344'),(31,'authtoken','0001_initial','2025-04-07 06:18:26.955871'),(32,'authtoken','0002_auto_20160226_1747','2025-04-07 06:18:27.003130'),(33,'authtoken','0003_tokenproxy','2025-04-07 06:18:27.003130'),(34,'authtoken','0004_alter_tokenproxy_options','2025-04-07 06:18:27.003130'),(35,'hrapp','0013_alter_schedule_name','2025-04-07 06:51:09.364127'),(36,'hrapp','0014_remove_evaluation_evaluator_and_more','2025-04-08 07:01:15.572703'),(37,'hrapp','0015_alter_evaluation_schedule','2025-04-08 07:01:15.698071'),(38,'hrapp','0016_evaluation_is_deleted','2025-04-22 07:22:27.707809'),(39,'hrapp','0002_user_profile_picture','2025-05-13 06:29:30.974506'),(40,'hrapp','0003_section_deleted_at','2025-05-15 07:16:17.471601'),(41,'hrapp','0004_token','2025-05-20 09:22:49.071635'),(42,'hrapp','0005_facultyassignment_is_active','2025-05-21 03:52:39.847417'),(43,'hrapp','0006_alter_room_slug_alter_schedule_semester_and_more','2025-05-23 05:19:13.405813'),(44,'hrapp','0007_alter_schedule_unique_together','2025-05-23 05:19:13.486919'),(45,'hrapp','0008_alter_schedule_unique_together','2025-05-23 05:19:13.515549'),(46,'hrapp','0009_alter_schedule_year','2025-05-23 05:19:13.578034'),(47,'hrapp','0010_schedule_unique_section_subject','2025-05-26 03:05:09.786675'),(48,'hrapp','0011_alter_section_name','2025-05-26 03:21:40.925857'),(49,'hrapp','0012_program_remove_course_professors_and_more','2025-05-26 07:07:20.672008'),(50,'hrapp','0013_evaluation_instructor_evaluation_name_and_more','2025-05-27 02:06:00.752835'),(51,'hrapp','0014_remove_evaluation_evaluators_and_more','2025-05-27 03:52:41.954809'),(52,'hrapp','0015_evaluation_evaluator','2025-05-27 06:54:01.747565'),(53,'hrapp','0016_alter_program_code_alter_program_professors_and_more','2025-05-29 07:25:16.725938'),(54,'hrapp','0017_alter_program_name','2025-06-10 07:12:40.937977'),(55,'hrapp','0018_timestamp_remove_evaluation_instructor_activities_and_more','2025-06-10 07:12:41.157470'),(56,'hrapp','0019_timestamp_evaluation_timestamp_time_records','2025-06-10 07:12:41.251662'),(57,'hrapp','0020_rename_time_records_timestamp_time_record','2025-06-10 07:12:41.267282'),(58,'hrapp','0021_evaluation_instructor','2025-06-10 07:12:41.330160'),(59,'hrapp','0022_evaluation_ai_feedback_alter_timestamp_time_record','2025-06-13 00:42:24.352911'),(60,'hrapp','0023_remove_schedule_unique_section_subject_and_more','2025-06-16 02:59:08.010114'),(61,'hrapp','0024_alter_user_is_deleted','2025-06-16 02:59:08.141360'),(62,'hrapp','0025_section_unique_section_program_year','2025-06-18 07:49:32.763101'),(63,'hrapp','0026_section_slug_alter_section_name','2025-06-18 07:51:04.417336'),(64,'hrapp','0027_remove_section_unique_section_program_year','2025-06-18 07:56:31.003974'),(65,'hrapp','0028_alter_section_unique_together','2025-06-18 09:21:42.521638'),(66,'hrapp','0029_remove_studentevaluation_user_professor_and_more','2025-06-23 02:28:29.533324'),(67,'hrapp','0030_alter_studentevaluation_title','2025-06-25 07:43:37.848154'),(68,'hrapp','0031_alter_section_name','2025-06-25 07:43:37.926827'),(69,'hrapp','0032_alter_schedule_name_alter_section_name','2025-06-25 07:47:47.663070'),(70,'hrapp','0033_remove_studentevaluationquestion_student_evaluation','2025-06-26 08:12:43.885846'),(71,'hrapp','0034_alter_studentevaluationresponse_unique_together','2025-07-07 01:47:40.771046'),(72,'hrapp','0035_faculty_program_faculty','2025-07-08 01:32:25.321336'),(73,'hrapp','0036_alter_faculty_dean_alter_faculty_professors','2025-07-08 06:32:00.852239');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('1qevkbd91dbohmkc4ltlix865cfizytx','.eJxVjMsOwiAQRf-FtSEFKg-X7v0GMswMUjWQlHZl_HfbpAvd3nPOfYsI61Li2nmOE4mLUOL0uyXAJ9cd0APqvUlsdZmnJHdFHrTLWyN-XQ_376BAL1sNyfAAaLUelfIZvHaJIOiAbM4OwJEnG8ZgyOXEgbJDDENWm-SQLYjPF_26OSs:1uHU15:_VGdHowzTieeNX3b0qXvHezifPrmSfvM-yrn8d5-fPw','2025-06-03 20:56:51.229866'),('1sx4jim8fs0ws7nmeym1mjrt7n4aed54','.eJxVjMsOwiAQRf-FtSEFKg-X7v0GMswMUjWQlHZl_HfbpAvd3nPOfYsI61Li2nmOE4mLUOL0uyXAJ9cd0APqvUlsdZmnJHdFHrTLWyN-XQ_376BAL1sNyfAAaLUelfIZvHaJIOiAbM4OwJEnG8ZgyOXEgbJDDENWm-SQLYjPF_26OSs:1uHGHH:iz2O5JMM9k_QZPp2psUn-5dbL98dKGTHnsA12Gymrv8','2025-06-03 06:16:39.841320'),('q2ujz9vnrclo0s5ky6nuskljezdpwhke','.eJxVjMsOwiAQRf-FtSEFKg-X7v0GMswMUjWQlHZl_HfbpAvd3nPOfYsI61Li2nmOE4mLUOL0uyXAJ9cd0APqvUlsdZmnJHdFHrTLWyN-XQ_376BAL1sNyfAAaLUelfIZvHaJIOiAbM4OwJEnG8ZgyOXEgbJDDENWm-SQLYjPF_26OSs:1uCDST:Q-CvJLfVfJJ-rJjdn-vM_Svx0_XCzTte3RhmJSxnBkY','2025-05-20 08:15:21.238090'),('vfqhyfu46adkcfom09lmwugw504np1as','.eJxVjDsOwjAQBe_iGllee_2jpOcM1sYfHEC2FCcV4u4QKQW0b2beiwXa1hq2kZcwJ3ZmSrDT7zhRfOS2k3Sndus89rYu88R3hR908GtP-Xk53L-DSqN-a2ERCaJTkCQ6LMVYachrLxxoNCDJ-OIBCBRprQVEi5JcIUspOkD2_gDJgTas:1uZnQR:dDfH6Uuq1q79jJby2plT0410P_wIt9ipAltLHO9cp1o','2025-07-24 09:18:43.107373'),('wn8gnklbprw689jsm52e2c3dspftdeuz','.eJxVjDsOwjAQBe_iGlnrD_aGkp4zRLv-4ACypTipEHdHllJA-2bmvcVM-1bmvad1XqK4CCVOvxtTeKY6QHxQvTcZWt3WheVQ5EG7vLWYXtfD_Tso1MuonbI-KZ8YvTk7Rm2RJrQ6Ga1AO3TGZp3NBJk4ZGADFoHBG44-chafL7k3Nz4:1uQz5G:FBvfBJmIuZ3F0lXrcFVgFW2gqV8OioaH0T_KieyLw-k','2025-06-30 01:56:26.784390'),('xn7l3ir9yr2srw4u8hb8xqsxd2mt1vzw','.eJxVjEEOwiAQAP_C2ZDCAi4evfsGssAiVUOT0p6MfzckPeh1ZjJvEWjfatg7r2HO4iKUOP2ySOnJbYj8oHZfZFrats5RjkQetsvbkvl1Pdq_QaVexxaT0daAQ6ujV8549N4bXdhpAqvVGRViAmujnRQpLgglU_SJAWHS4vMFmBs2ZQ:1u1zjJ:gfEFxPz2i1uZPWK7lgIdDbR6xYfDP-vEQL7GksmaBgo','2025-04-22 03:34:29.205098');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
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
  `evaluation_type` varchar(20) NOT NULL,
  `additional_comments` longtext,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `schedule_id` bigint DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `evaluator_id` bigint DEFAULT NULL,
  `instructor_id` bigint DEFAULT NULL,
  `ai_feedback` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hrapp_evaluation_schedule_id_21fc731b_fk_hrapp_schedule_id` (`schedule_id`),
  KEY `hrapp_evaluation_evaluator_id_4b1098b2_fk_hrapp_user_id` (`evaluator_id`),
  KEY `hrapp_evaluation_instructor_id_8bc32845_fk_hrapp_user_id` (`instructor_id`),
  CONSTRAINT `hrapp_evaluation_evaluator_id_4b1098b2_fk_hrapp_user_id` FOREIGN KEY (`evaluator_id`) REFERENCES `hrapp_user` (`id`),
  CONSTRAINT `hrapp_evaluation_instructor_id_8bc32845_fk_hrapp_user_id` FOREIGN KEY (`instructor_id`) REFERENCES `hrapp_user` (`id`),
  CONSTRAINT `hrapp_evaluation_schedule_id_21fc731b_fk_hrapp_schedule_id` FOREIGN KEY (`schedule_id`) REFERENCES `hrapp_schedule` (`id`)

) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_evaluation`
--

LOCK TABLES `hrapp_evaluation` WRITE;
/*!40000 ALTER TABLE `hrapp_evaluation` DISABLE KEYS */;

INSERT INTO `hrapp_evaluation` VALUES (67,'2025-07-15','copus_1','','2025-07-15 08:26:42.041719','2025-07-15 08:26:42.041719',13,NULL,0,'Section 4 BSIT - Bachelors of Science in Information Technology - None - Intelligent Systems - 1 - rjdaw.sjc@phinmaed.com - 2025-07-15 - copus_1',1,3,NULL);

/*!40000 ALTER TABLE `hrapp_evaluation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_faculty`
--

DROP TABLE IF EXISTS `hrapp_faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_faculty` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `dean_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `hrapp_faculty_dean_id_9811ddc6_fk_hrapp_user_id` (`dean_id`),
  CONSTRAINT `hrapp_faculty_dean_id_9811ddc6_fk_hrapp_user_id` FOREIGN KEY (`dean_id`) REFERENCES `hrapp_user` (`id`)

) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_faculty`
--

LOCK TABLES `hrapp_faculty` WRITE;
/*!40000 ALTER TABLE `hrapp_faculty` DISABLE KEYS */;
INSERT INTO `hrapp_faculty` VALUES (1,'CITE - College of Information  Technology Education',1),(2,'CAAS - College of Arts and Sciences',8),(3,'COED - College of Education',4);
/*!40000 ALTER TABLE `hrapp_faculty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_faculty_evaluations`
--

DROP TABLE IF EXISTS `hrapp_faculty_evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_faculty_evaluations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `faculty_id` bigint NOT NULL,
  `evaluation_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hrapp_faculty_evaluations_faculty_id_evaluation_id_8a31d8f2_uniq` (`faculty_id`,`evaluation_id`),
  KEY `hrapp_faculty_evalua_evaluation_id_68ce97fe_fk_hrapp_eva` (`evaluation_id`),
  CONSTRAINT `hrapp_faculty_evalua_evaluation_id_68ce97fe_fk_hrapp_eva` FOREIGN KEY (`evaluation_id`) REFERENCES `hrapp_evaluation` (`id`),
  CONSTRAINT `hrapp_faculty_evalua_faculty_id_55221c3e_fk_hrapp_fac` FOREIGN KEY (`faculty_id`) REFERENCES `hrapp_faculty` (`id`)

) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_faculty_evaluations`
--

LOCK TABLES `hrapp_faculty_evaluations` WRITE;
/*!40000 ALTER TABLE `hrapp_faculty_evaluations` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrapp_faculty_evaluations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_faculty_professors`
--

DROP TABLE IF EXISTS `hrapp_faculty_professors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_faculty_professors` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `faculty_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hrapp_faculty_professors_faculty_id_user_id_67a87813_uniq` (`faculty_id`,`user_id`),
  KEY `hrapp_faculty_professors_user_id_637a4a4d_fk_hrapp_user_id` (`user_id`),
  CONSTRAINT `hrapp_faculty_professors_faculty_id_bc7a47d8_fk_hrapp_faculty_id` FOREIGN KEY (`faculty_id`) REFERENCES `hrapp_faculty` (`id`),
  CONSTRAINT `hrapp_faculty_professors_user_id_637a4a4d_fk_hrapp_user_id` FOREIGN KEY (`user_id`) REFERENCES `hrapp_user` (`id`)

) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_faculty_professors`
--

LOCK TABLES `hrapp_faculty_professors` WRITE;
/*!40000 ALTER TABLE `hrapp_faculty_professors` DISABLE KEYS */;

INSERT INTO `hrapp_faculty_professors` VALUES (2,1,3),(5,1,4),(1,1,24),(3,2,7),(4,3,7);

/*!40000 ALTER TABLE `hrapp_faculty_professors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_faculty_student_evaluations`
--

DROP TABLE IF EXISTS `hrapp_faculty_student_evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_faculty_student_evaluations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `faculty_id` bigint NOT NULL,
  `studentevaluation_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hrapp_faculty_student_ev_faculty_id_studentevalua_96088312_uniq` (`faculty_id`,`studentevaluation_id`),
  KEY `hrapp_faculty_studen_studentevaluation_id_9eec17d0_fk_hrapp_stu` (`studentevaluation_id`),
  CONSTRAINT `hrapp_faculty_studen_faculty_id_d22322e6_fk_hrapp_fac` FOREIGN KEY (`faculty_id`) REFERENCES `hrapp_faculty` (`id`),
  CONSTRAINT `hrapp_faculty_studen_studentevaluation_id_9eec17d0_fk_hrapp_stu` FOREIGN KEY (`studentevaluation_id`) REFERENCES `hrapp_studentevaluation` (`id`)

) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_faculty_student_evaluations`
--

LOCK TABLES `hrapp_faculty_student_evaluations` WRITE;
/*!40000 ALTER TABLE `hrapp_faculty_student_evaluations` DISABLE KEYS */;
INSERT INTO `hrapp_faculty_student_evaluations` VALUES (1,1,20),(2,1,21),(3,1,22),(4,1,23);
/*!40000 ALTER TABLE `hrapp_faculty_student_evaluations` ENABLE KEYS */;
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
  `is_active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `hrapp_facultyassignment_user_id_6cc405ad_fk_hrapp_user_id` (`user_id`),
  CONSTRAINT `hrapp_facultyassignment_user_id_6cc405ad_fk_hrapp_user_id` FOREIGN KEY (`user_id`) REFERENCES `hrapp_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_facultyassignment`
--

LOCK TABLES `hrapp_facultyassignment` WRITE;
/*!40000 ALTER TABLE `hrapp_facultyassignment` DISABLE KEYS */;
INSERT INTO `hrapp_facultyassignment` VALUES (1,'2025-04-07 02:56:19.519734','2025-04-07 02:56:19.519734',4,NULL,1),(2,'2025-04-07 08:24:47.515140','2025-04-07 08:28:15.261440',5,NULL,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_facultyschedule`
--

LOCK TABLES `hrapp_facultyschedule` WRITE;
/*!40000 ALTER TABLE `hrapp_facultyschedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrapp_facultyschedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_program`
--

DROP TABLE IF EXISTS `hrapp_program`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_program` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `is_active` tinyint(1) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(50) DEFAULT NULL,
  `code` varchar(50) DEFAULT NULL,
  `faculty_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hrapp_program_name_a98f115b_uniq` (`name`),
  KEY `hrapp_program_slug_cf2b077a` (`slug`),
  KEY `hrapp_program_faculty_id_246af421_fk_hrapp_faculty_id` (`faculty_id`),
  CONSTRAINT `hrapp_program_faculty_id_246af421_fk_hrapp_faculty_id` FOREIGN KEY (`faculty_id`) REFERENCES `hrapp_faculty` (`id`)

) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_program`
--

LOCK TABLES `hrapp_program` WRITE;
/*!40000 ALTER TABLE `hrapp_program` DISABLE KEYS */;
INSERT INTO `hrapp_program` VALUES (1,1,NULL,'2025-05-28 02:40:51.259022','2025-07-10 08:30:10.576626','BSIT - Bachelors of Science in Information Technology',NULL,NULL,1),(2,1,NULL,'2025-05-29 07:25:43.015842','2025-07-10 08:43:43.508263','BSED - Bachelors of Science in Education - Major in Filipino',NULL,NULL,3),(3,1,NULL,'2025-05-29 08:48:34.201720','2025-06-13 01:41:03.865786','CMA - Certified Management Account',NULL,NULL,NULL),(4,1,NULL,'2025-05-29 08:51:32.847907','2025-06-11 09:17:47.607410','BSBA - Bachelors of Science in Business Administration',NULL,NULL,NULL),(5,1,NULL,'2025-06-25 06:24:33.335598','2025-07-11 02:38:54.345635','BSCS - Bachelor of Science in Computer Science',NULL,NULL,1);
/*!40000 ALTER TABLE `hrapp_program` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_programprofessor`
--

DROP TABLE IF EXISTS `hrapp_programprofessor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_programprofessor` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assigned_at` datetime(6) NOT NULL,
  `professor_id` bigint DEFAULT NULL,
  `program_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `hrapp_programprofessor_program_id_a003bde5_fk_hrapp_program_id` (`program_id`),
  KEY `hrapp_programprofessor_professor_id_31a8e72d_fk_hrapp_user_id` (`professor_id`),
  CONSTRAINT `hrapp_programprofessor_professor_id_31a8e72d_fk_hrapp_user_id` FOREIGN KEY (`professor_id`) REFERENCES `hrapp_user` (`id`),
  CONSTRAINT `hrapp_programprofessor_program_id_a003bde5_fk_hrapp_program_id` FOREIGN KEY (`program_id`) REFERENCES `hrapp_program` (`id`)

) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_programprofessor`
--

LOCK TABLES `hrapp_programprofessor` WRITE;
/*!40000 ALTER TABLE `hrapp_programprofessor` DISABLE KEYS */;
INSERT INTO `hrapp_programprofessor` VALUES (1,'2025-05-28 09:09:04.573204',4,1),(2,'2025-05-29 07:13:07.240802',3,1),(3,'2025-06-16 03:47:22.520870',24,1),(4,'2025-07-10 08:29:55.305577',27,5),(5,'2025-07-10 08:30:10.576626',1,1),(6,'2025-07-11 02:38:54.351787',3,5);
/*!40000 ALTER TABLE `hrapp_programprofessor` ENABLE KEYS */;
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
  `slug` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)

) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_room`
--

LOCK TABLES `hrapp_room` WRITE;
/*!40000 ALTER TABLE `hrapp_room` DISABLE KEYS */;
INSERT INTO `hrapp_room` VALUES (2,'Comlab - 1','CL-1',1,NULL,'2025-04-03 07:53:05.181559','2025-06-10 07:14:29.869977'),(3,'D-204','D-204',1,NULL,'2025-04-04 05:22:42.777660','2025-06-10 07:14:30.350745'),(4,'Comlab - 2','LAB2',1,NULL,'2025-05-23 02:52:24.639515','2025-06-16 02:13:58.454090'),(5,'Dimasalang - 205','D-205',1,NULL,'2025-05-23 02:52:46.926953','2025-06-10 07:14:31.781143'),(6,'Dimasalang - 206','D-206',1,NULL,'2025-05-23 02:53:12.650242','2025-05-29 09:11:58.232038'),(8,'Computer Laboratory - 3','Comlab-3',1,NULL,'2025-06-16 02:13:53.517658','2025-06-16 02:13:53.517658'),(9,'Dimasalang - 404','D-404',1,NULL,'2025-06-16 02:14:16.440693','2025-06-16 02:14:16.440693'),(10,'Dimasalang - 203','D-203',1,NULL,'2025-06-16 02:14:30.755904','2025-06-16 02:14:30.755904'),(11,'Silang Hall - 401',NULL,1,NULL,'2025-06-20 04:44:04.938315','2025-06-20 04:44:04.938315');
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
  `name` varchar(255) DEFAULT NULL,
  `start_time` time(6) DEFAULT NULL,
  `end_time` time(6) DEFAULT NULL,
  `semester` varchar(10) NOT NULL,
  `year` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `room_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  `section_id` bigint DEFAULT NULL,
  `program_id` bigint DEFAULT NULL,
  `instructor_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_section_subject` (`program_id`,`section_id`,`subject_id`),
  KEY `hrapp_schedule_room_id_be7e1ea8_fk_hrapp_room_id` (`room_id`),
  KEY `hrapp_schedule_subject_id_a91e0e64_fk_hrapp_subject_id` (`subject_id`),
  KEY `hrapp_schedule_program_id_819071da_fk_hrapp_program_id` (`program_id`),
  KEY `hrapp_schedule_instructor_id_6509ffd7_fk_hrapp_user_id` (`instructor_id`),
  KEY `hrapp_schedule_section_id_791d642a` (`section_id`),
  CONSTRAINT `hrapp_schedule_instructor_id_6509ffd7_fk_hrapp_user_id` FOREIGN KEY (`instructor_id`) REFERENCES `hrapp_user` (`id`),
  CONSTRAINT `hrapp_schedule_program_id_819071da_fk_hrapp_program_id` FOREIGN KEY (`program_id`) REFERENCES `hrapp_program` (`id`),
  CONSTRAINT `hrapp_schedule_room_id_be7e1ea8_fk_hrapp_room_id` FOREIGN KEY (`room_id`) REFERENCES `hrapp_room` (`id`),
  CONSTRAINT `hrapp_schedule_section_id_791d642a_fk_hrapp_section_id` FOREIGN KEY (`section_id`) REFERENCES `hrapp_section` (`id`),
  CONSTRAINT `hrapp_schedule_subject_id_a91e0e64_fk_hrapp_subject_id` FOREIGN KEY (`subject_id`) REFERENCES `hrapp_subject` (`id`)

) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_schedule`
--

LOCK TABLES `hrapp_schedule` WRITE;
/*!40000 ALTER TABLE `hrapp_schedule` DISABLE KEYS */;
INSERT INTO `hrapp_schedule` VALUES (9,'Section 4 BSIT - Bachelors of Science in Information Technology - None - Networking I - 1','10:00:00.000000','13:00:00.000000','First','2025-06-25',0,'2025-07-08 06:58:22.933113','2025-06-25 06:30:06.215264','2025-07-08 06:58:22.941736',2,8,15,1,3),(10,'Section 4 BSIT - Bachelors of Science in Information Technology - None - Networking II - 1','15:00:00.000000','16:00:00.000000','First','2025-06-26',0,'2025-07-08 06:58:21.148961','2025-06-25 07:42:02.134255','2025-07-08 06:58:21.151989',4,2,15,1,3),(11,'Section 4 BSIT - Bachelors of Science in Information Technology - None - Computer Programming I - 1','07:00:00.000000','08:00:00.000000','First','2025-06-25',1,NULL,'2025-06-25 07:47:57.283792','2025-07-01 09:19:01.697113',4,12,15,1,3),(12,'Section 4 BSIT - Bachelors of Science in Information Technology - None - Computer Programming II - 1','08:00:00.000000','09:00:00.000000','First','2025-06-25',1,NULL,'2025-06-25 07:49:47.791512','2025-07-01 09:18:57.387640',5,7,15,1,3),(13,'Section 4 BSIT - Bachelors of Science in Information Technology - None - Intelligent Systems - 1','10:00:00.000000','11:00:00.000000','First','2025-06-25',1,NULL,'2025-06-25 07:50:31.872062','2025-07-01 09:18:54.263115',8,6,15,1,3),(14,'Section 4 BSIT - Bachelors of Science in Information Technology - None - Data Structures and Algorithims - 1','17:30:00.000000','18:30:00.000000','First','2025-07-01',1,NULL,'2025-07-01 09:09:56.935625','2025-07-01 09:18:49.661834',10,11,15,1,27);
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
  `name` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `year_level` varchar(1) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `program_id` bigint DEFAULT NULL,
  `slug` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `hrapp_section_program_id_60c1a108_fk_hrapp_program_id` (`program_id`),
  CONSTRAINT `hrapp_section_program_id_60c1a108_fk_hrapp_program_id` FOREIGN KEY (`program_id`) REFERENCES `hrapp_program` (`id`)

) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_section`
--

LOCK TABLES `hrapp_section` WRITE;
/*!40000 ALTER TABLE `hrapp_section` DISABLE KEYS */;
INSERT INTO `hrapp_section` VALUES (12,'Section 1 BSIT - Bachelors of Science in Information Technology - 1st Year',1,'2025-06-19 03:19:10.434661','2025-06-25 07:56:51.730742','1',NULL,1,NULL),(13,'Section 2 BSIT - Bachelors of Science in Information Technology - 1st Year',1,'2025-06-19 04:51:01.355365','2025-06-25 07:56:45.323155','1',NULL,1,NULL),(14,'Section 3 BSIT - Bachelors of Science in Information Technology - 1st Year',1,'2025-06-19 04:52:07.002413','2025-06-25 07:56:38.409266','1',NULL,1,NULL),(15,'Section 4 BSIT - Bachelors of Science in Information Technology - None',1,'2025-06-20 05:29:00.099858','2025-07-02 08:32:26.188617','1',NULL,1,NULL);
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

) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_section_students`
--

LOCK TABLES `hrapp_section_students` WRITE;
/*!40000 ALTER TABLE `hrapp_section_students` DISABLE KEYS */;
INSERT INTO `hrapp_section_students` VALUES (26,12,1),(27,12,6),(38,12,25),(28,13,16),(37,13,18),(36,13,25),(31,14,5),(30,14,18),(35,14,25),(32,15,1),(33,15,6),(34,15,25);
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
  `title` varchar(255) DEFAULT NULL,
  `description` longtext,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `schedule_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hrapp_studentevaluat_schedule_id_608482ad_fk_hrapp_sch` (`schedule_id`),
  CONSTRAINT `hrapp_studentevaluat_schedule_id_608482ad_fk_hrapp_sch` FOREIGN KEY (`schedule_id`) REFERENCES `hrapp_schedule` (`id`)

) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_studentevaluation`
--

LOCK TABLES `hrapp_studentevaluation` WRITE;
/*!40000 ALTER TABLE `hrapp_studentevaluation` DISABLE KEYS */;
INSERT INTO `hrapp_studentevaluation` VALUES (20,'Student Evaluation: Francisco Dawal - Networking II (Inactive)','NEW TUESDAY JULY 1 FOR IMPORTING PRACTICE','2025-07-01 01:47:20.117697','2025-07-01 01:47:30.606154',NULL,10),(21,'Student Evaluation: Francisco Dawal - Intelligent Systems (Active)','INTEL SYS JULY 2','2025-07-02 08:38:35.475192','2025-07-02 08:38:35.570299',NULL,13),(22,'Student Evaluation: rjdaw.sjc@phinmaed.com - Networking I (Active)','CREATE DIALOG CREATE AND IMPORT QUESTION','2025-07-04 03:59:19.904744','2025-07-04 03:59:20.007444',NULL,9),(23,'Student Evaluation: Francisco Dawal - Networking I (Active)','','2025-07-08 06:57:25.430960','2025-07-08 06:57:25.489165',NULL,9);
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

) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_studentevaluation_import_questions`
--

LOCK TABLES `hrapp_studentevaluation_import_questions` WRITE;
/*!40000 ALTER TABLE `hrapp_studentevaluation_import_questions` DISABLE KEYS */;
INSERT INTO `hrapp_studentevaluation_import_questions` VALUES (68,20,38),(69,20,39),(70,21,40),(71,22,38),(72,22,39),(73,22,40),(74,22,41),(75,22,42),(76,22,43),(78,23,38),(77,23,44);
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
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)

) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_studentevaluationquestion`
--

LOCK TABLES `hrapp_studentevaluationquestion` WRITE;
/*!40000 ALTER TABLE `hrapp_studentevaluationquestion` DISABLE KEYS */;
INSERT INTO `hrapp_studentevaluationquestion` VALUES (38,'MCQ CREATE QUEST SAMP 1','MCQ','[\"T\", \"2\"]','2025-07-01 01:46:54.519773','2025-07-01 01:46:54.519773',NULL),(39,'RT TUESDAY JULY 1 SAMPLE','RATING',NULL,'2025-07-01 01:46:54.544889','2025-07-01 01:46:54.544889',NULL),(40,'JULY 2 MCQ','MCQ','[\"A\", \"B\"]','2025-07-02 08:38:35.522536','2025-07-02 08:38:35.522536',NULL),(41,'JULY 4 COMM BOX','TEXT',NULL,'2025-07-04 03:59:19.931786','2025-07-04 03:59:19.931786',NULL),(42,'JULY 4 MCQ','MCQ','[\"AYOKO NA\", \"PAGOD NA KO\"]','2025-07-04 03:59:19.954915','2025-07-04 03:59:19.954915',NULL),(43,'JULY 4 RT','RATING',NULL,'2025-07-04 03:59:19.975020','2025-07-04 03:59:19.975020',NULL),(44,'sir juls malupit','RATING',NULL,'2025-07-08 06:57:25.461309','2025-07-08 06:57:25.461309',NULL);
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
  `student_eval_question_id` bigint DEFAULT NULL,
  `student_evaluation_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hrapp_studentevaluationr_user_id_student_evaluati_e3c1bd15_uniq` (`user_id`,`student_evaluation_id`,`student_eval_question_id`),
  KEY `hrapp_studentevaluat_student_eval_questio_fdc327bb_fk_hrapp_stu` (`student_eval_question_id`),
  KEY `hrapp_studentevaluat_student_evaluation_i_9d41dd96_fk_hrapp_stu` (`student_evaluation_id`),
  KEY `hrapp_studentevaluat_user_id_38a51ba8_fk_hrapp_use` (`user_id`),
  CONSTRAINT `hrapp_studentevaluat_student_eval_questio_fdc327bb_fk_hrapp_stu` FOREIGN KEY (`student_eval_question_id`) REFERENCES `hrapp_studentevaluationquestion` (`id`),
  CONSTRAINT `hrapp_studentevaluat_student_evaluation_i_9d41dd96_fk_hrapp_stu` FOREIGN KEY (`student_evaluation_id`) REFERENCES `hrapp_studentevaluation` (`id`),
  CONSTRAINT `hrapp_studentevaluat_user_id_38a51ba8_fk_hrapp_use` FOREIGN KEY (`user_id`) REFERENCES `hrapp_user` (`id`)

) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_studentevaluationresponse`
--

LOCK TABLES `hrapp_studentevaluationresponse` WRITE;
/*!40000 ALTER TABLE `hrapp_studentevaluationresponse` DISABLE KEYS */;
INSERT INTO `hrapp_studentevaluationresponse` VALUES (34,'B','2025-07-07 06:41:59.249662','2025-07-07 06:41:59.249662',40,21,25,NULL),(35,'2','2025-07-07 06:42:45.236646','2025-07-07 06:42:45.236646',38,22,25,NULL),(36,'5','2025-07-07 06:42:45.236646','2025-07-07 06:42:45.236646',39,22,25,NULL),(37,'B','2025-07-07 06:42:45.236646','2025-07-07 06:42:45.236646',40,22,25,NULL),(38,'SAMPLE SAGOT SA NET 1 ','2025-07-07 06:42:45.236646','2025-07-07 06:42:45.236646',41,22,25,NULL);
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

) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_subject`
--

LOCK TABLES `hrapp_subject` WRITE;
/*!40000 ALTER TABLE `hrapp_subject` DISABLE KEYS */;
INSERT INTO `hrapp_subject` VALUES (2,'Networking II','NET-2',1,NULL,'2025-04-03 07:53:18.514301','2025-07-02 08:30:36.449584'),(3,'Panitikang Filipino','FIL-127',1,NULL,'2025-04-04 05:21:00.591703','2025-04-04 05:21:00.591703'),(4,'Human Computer Interaction 1','HCI-I',1,NULL,'2025-05-26 03:06:18.006137','2025-05-26 03:06:29.283486'),(5,'Systems Integration and Architecture 1','SIA-1',1,NULL,'2025-05-26 03:06:46.149364','2025-05-26 03:06:46.149364'),(6,'Intelligent Systems','IS',1,NULL,'2025-05-26 03:06:58.149899','2025-05-26 03:06:58.149899'),(7,'Computer Programming II','Prog-2',1,NULL,'2025-05-29 06:09:58.809598','2025-06-16 02:09:45.045030'),(8,'Networking I','NET-1',1,NULL,'2025-06-16 02:09:14.756087','2025-06-16 02:09:14.756087'),(9,'Information Assurance and Security I','IAS-1',1,NULL,'2025-06-16 02:11:54.509900','2025-06-16 02:11:54.509900'),(10,'Information Management','IM-1',1,NULL,'2025-06-16 02:12:32.446960','2025-06-16 02:12:32.446960'),(11,'Data Structures and Algorithims','DSA',1,NULL,'2025-06-16 02:12:55.218655','2025-06-16 02:12:55.218655'),(12,'Computer Programming I','',1,NULL,'2025-06-20 04:47:54.750551','2025-06-20 04:47:54.750551');
/*!40000 ALTER TABLE `hrapp_subject` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_timestamp`
--

DROP TABLE IF EXISTS `hrapp_timestamp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_timestamp` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_activities` json DEFAULT NULL,
  `instructor_activities` json DEFAULT NULL,
  `student_comments` json DEFAULT NULL,
  `instructor_comments` json DEFAULT NULL,
  `evaluation_id` bigint NOT NULL,
  `time_record` time(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `hrapp_timestamp_evaluation_id_e744721a_fk_hrapp_evaluation_id` (`evaluation_id`),
  CONSTRAINT `hrapp_timestamp_evaluation_id_e744721a_fk_hrapp_evaluation_id` FOREIGN KEY (`evaluation_id`) REFERENCES `hrapp_evaluation` (`id`)

) ENGINE=InnoDB AUTO_INCREMENT=1899 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_timestamp`
--

LOCK TABLES `hrapp_timestamp` WRITE;
/*!40000 ALTER TABLE `hrapp_timestamp` DISABLE KEYS */;

INSERT INTO `hrapp_timestamp` VALUES (1869,'{\"group\": false, \"other\": false, \"waiting\": false, \"listening\": true, \"test/quiz\": false, \"ask_question\": false, \"answer_question\": false, \"individual_thinking\": false, \"student_presentations\": false, \"whole_class_discussion\": false}','{\"other\": false, \"lecture\": true, \"waiting\": false, \"demonstrative\": false, \"pose_question\": false, \"administrative\": false, \"moving/guiding\": false, \"answer_questions\": false, \"realtime_writing\": false, \"1_on_1_discussion\": false, \"follow_up_question\": false}','{\"comment\": \"\"}','{\"comment\": \"\"}',67,'00:02:00.000000'),(1870,'{\"group\": false, \"other\": false, \"waiting\": false, \"listening\": true, \"test/quiz\": false, \"ask_question\": false, \"answer_question\": false, \"individual_thinking\": false, \"student_presentations\": false, \"whole_class_discussion\": false}','{\"other\": false, \"lecture\": true, \"waiting\": false, \"demonstrative\": false, \"pose_question\": false, \"administrative\": false, \"moving/guiding\": false, \"answer_questions\": false, \"realtime_writing\": false, \"1_on_1_discussion\": false, \"follow_up_question\": false}','{\"comment\": \"\"}','{\"comment\": \"\"}',67,'00:04:00.000000'),(1871,'{\"group\": false, \"other\": false, \"waiting\": false, \"listening\": true, \"test/quiz\": false, \"ask_question\": false, \"answer_question\": false, \"individual_thinking\": false, \"student_presentations\": false, \"whole_class_discussion\": false}','{\"other\": false, \"lecture\": true, \"waiting\": false, \"demonstrative\": false, \"pose_question\": false, \"administrative\": false, \"moving/guiding\": false, \"answer_questions\": false, \"realtime_writing\": false, \"1_on_1_discussion\": false, \"follow_up_question\": false}','{\"comment\": \"\"}','{\"comment\": \"\"}',67,'00:06:00.000000'),(1872,'{\"group\": false, \"other\": false, \"waiting\": false, \"listening\": true, \"test/quiz\": false, \"ask_question\": false, \"answer_question\": false, \"individual_thinking\": false, \"student_presentations\": false, \"whole_class_discussion\": false}','{\"other\": false, \"lecture\": true, \"waiting\": false, \"demonstrative\": false, \"pose_question\": false, \"administrative\": false, \"moving/guiding\": false, \"answer_questions\": false, \"realtime_writing\": false, \"1_on_1_discussion\": false, \"follow_up_question\": false}','{\"comment\": \"\"}','{\"comment\": \"\"}',67,'00:08:00.000000'),(1873,'{\"group\": false, \"other\": false, \"waiting\": false, \"listening\": true, \"test/quiz\": false, \"ask_question\": false, \"answer_question\": false, \"individual_thinking\": false, \"student_presentations\": false, \"whole_class_discussion\": false}','{\"other\": false, \"lecture\": true, \"waiting\": false, \"demonstrative\": false, \"pose_question\": false, \"administrative\": false, \"moving/guiding\": false, \"answer_questions\": false, \"realtime_writing\": false, \"1_on_1_discussion\": false, \"follow_up_question\": false}','{\"comment\": \"\"}','{\"comment\": \"\"}',67,'00:10:00.000000'),(1874,'{\"group\": false, \"other\": false, \"waiting\": false, \"listening\": true, \"test/quiz\": false, \"ask_question\": false, \"answer_question\": false, \"individual_thinking\": false, \"student_presentations\": false, \"whole_class_discussion\": false}','{\"other\": false, \"lecture\": true, \"waiting\": false, \"demonstrative\": false, \"pose_question\": false, \"administrative\": false, \"moving/guiding\": false, \"answer_questions\": false, \"realtime_writing\": false, \"1_on_1_discussion\": false, \"follow_up_question\": false}','{\"comment\": \"\"}','{\"comment\": \"\"}',67,'00:12:00.000000'),(1875,'[]','[]','{}','{}',67,'00:14:00.000000'),(1876,'[]','[]','{}','{}',67,'00:16:00.000000'),(1877,'[]','[]','{}','{}',67,'00:18:00.000000'),(1878,'[]','[]','{}','{}',67,'00:20:00.000000'),(1879,'[]','[]','{}','{}',67,'00:22:00.000000'),(1880,'[]','[]','{}','{}',67,'00:24:00.000000'),(1881,'[]','[]','{}','{}',67,'00:26:00.000000'),(1882,'[]','[]','{}','{}',67,'00:28:00.000000'),(1883,'[]','[]','{}','{}',67,'00:30:00.000000'),(1884,'[]','[]','{}','{}',67,'00:32:00.000000'),(1885,'[]','[]','{}','{}',67,'00:34:00.000000'),(1886,'[]','[]','{}','{}',67,'00:36:00.000000'),(1887,'[]','[]','{}','{}',67,'00:38:00.000000'),(1888,'[]','[]','{}','{}',67,'00:40:00.000000'),(1889,'[]','[]','{}','{}',67,'00:42:00.000000'),(1890,'[]','[]','{}','{}',67,'00:44:00.000000'),(1891,'[]','[]','{}','{}',67,'00:46:00.000000'),(1892,'[]','[]','{}','{}',67,'00:48:00.000000'),(1893,'[]','[]','{}','{}',67,'00:50:00.000000'),(1894,'[]','[]','{}','{}',67,'00:52:00.000000'),(1895,'[]','[]','{}','{}',67,'00:54:00.000000'),(1896,'[]','[]','{}','{}',67,'00:56:00.000000'),(1897,'[]','[]','{}','{}',67,'00:58:00.000000'),(1898,'{\"group\": false, \"other\": false, \"waiting\": false, \"listening\": true, \"test/quiz\": false, \"ask_question\": false, \"answer_question\": false, \"individual_thinking\": false, \"student_presentations\": false, \"whole_class_discussion\": false}','{\"other\": false, \"lecture\": true, \"waiting\": false, \"demonstrative\": false, \"pose_question\": false, \"administrative\": false, \"moving/guiding\": false, \"answer_questions\": false, \"realtime_writing\": false, \"1_on_1_discussion\": false, \"follow_up_question\": false}','{\"comment\": \"\"}','{\"comment\": \"\"}',67,'00:00:00.000000');

/*!40000 ALTER TABLE `hrapp_timestamp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrapp_token`
--

DROP TABLE IF EXISTS `hrapp_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hrapp_token` (
  `token_ptr_id` varchar(40) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`token_ptr_id`),
  CONSTRAINT `hrapp_token_token_ptr_id_3e19af15_fk_authtoken_token_key` FOREIGN KEY (`token_ptr_id`) REFERENCES `authtoken_token` (`key`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_token`
--

LOCK TABLES `hrapp_token` WRITE;
/*!40000 ALTER TABLE `hrapp_token` DISABLE KEYS */;

INSERT INTO `hrapp_token` VALUES ('1f3a187f47e98f6d199aba6af131578b0318b4c0','2025-07-01 15:06:15.024913'),('68c28ae40c0d1a4b9f90acdf4f201a1e6d6d3217','2025-06-16 09:46:46.850474'),('7ed00a489e520a553536e00bd2383250ace53e6e','2025-07-01 15:08:38.286044'),('c1fb4d00dbdd79c9135ef789260f7bef9d7fa2db','2025-07-16 10:33:41.234307'),('c91f5a18786d691c2577ece77a71a34e1eb7ea34','2025-07-10 15:18:06.048199');

/*!40000 ALTER TABLE `hrapp_token` ENABLE KEYS */;
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
  `is_deleted` tinyint(1) DEFAULT NULL,
  `profile_picture` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `hrapp_user_supervisor_id_497635d9_fk_hrapp_user_id` (`supervisor_id`),
  CONSTRAINT `hrapp_user_supervisor_id_497635d9_fk_hrapp_user_id` FOREIGN KEY (`supervisor_id`) REFERENCES `hrapp_user` (`id`)

) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_user`
--

LOCK TABLES `hrapp_user` WRITE;
/*!40000 ALTER TABLE `hrapp_user` DISABLE KEYS */;

INSERT INTO `hrapp_user` VALUES (1,'pbkdf2_sha256$870000$QSNfNa7lM9jm70JPjaTkIN$DlrUm4PmTbvrMAfRcf1oWT+rZDjijIdjfNpVhG8Q4vI=','2025-06-30 02:00:23.000000',0,'Tinangeli','Jazel','Alim',1,1,'2025-04-03 04:49:41.000000','espinedamartin14@yahoo.com',NULL,0,''),(3,'pbkdf2_sha256$870000$lO4uWw9kugvGZ7KEF1LnNC$3qHalnASzxcL7Z7ZtJQzP3ih/uXs9SlVNENJsb1GGx8=',NULL,0,'Rjdawal','Francisco','Dawal',0,1,'2025-04-03 06:33:06.000000','rjdaw.sjc@phinmaed.com',4,0,NULL),(4,'pbkdf2_sha256$1000000$owIph9FiGwVHENp5KaWvOx$WPqmrkVrWiVgwWVbvMLgE1PN0G0B2gdKn6RxSd/sPqw=',NULL,0,'rommeldeocaris','Rommel','Deocaris',0,1,'2025-04-03 07:32:41.000000','romdeo.sjc@phinmaed.com',NULL,0,''),(5,'pbkdf2_sha256$870000$MVsLpR7ED83yiGoZm7g28h$ULKu5+fNh5o/W+vq2LlDFPkUJ9FkOIiEuSA+uJ0+Y1g=',NULL,0,'chstrsp','Chester','Espineda',0,1,'2025-04-04 05:10:07.154787','chor.sjc@phinmaed.com',NULL,0,NULL),(6,'pbkdf2_sha256$870000$16HsV82rE6nqg3u7aFCuhP$MJQORIBOPRnJLPXExRZsymgCBBhv+yxZI8ahOLKJxF8=',NULL,0,'yourlifemymeme','Renzo','Cua',0,1,'2025-04-04 05:12:11.000000','rencua.sjc@phinmaed.com',NULL,0,NULL),(7,'pbkdf2_sha256$870000$dRvU8NRzyMCOaG2bGlgz1I$iQZYNohlEb+nXZj/+cpKUoWo/UBFY6zvXBXjhzkcKa0=',NULL,0,'HazeDulay','Hazel','Dulay',0,1,'2025-04-04 05:15:47.000000','HazelDulay@phinmaed.com',8,0,''),(8,'pbkdf2_sha256$870000$8l9rpcu2i1I0muCl1kCXOF$xIgVFYhwWApCGyEFqhxIK6YgfDAatP56YIYptalb7lE=',NULL,0,'JulieDayat','Juliet','Dayat',0,1,'2025-04-04 05:19:42.000000','JuDayat.sjc@phinmaed.com',NULL,0,NULL),(16,'pbkdf2_sha256$870000$JVfCRL1ZnQsG3U45WG6W4A$pB0x55hJJAgmDMV+9zUeByknkfiueeydKixtGW84dlg=',NULL,0,'apekz','','',0,1,'2025-04-24 02:06:42.516160','fazed.sjc@phinmaed.com',NULL,0,NULL),(18,'!EGZfOiepzb9iPIxbKOfLQZGrjwrGjF5mOwzJd7tN',NULL,0,'chstrp','Chester','Espineda',0,1,'2025-04-29 08:07:01.365094','ches.espineda.sjc@phinmaed.com',NULL,0,''),(19,'pbkdf2_sha256$870000$esLKRpqTSVxZ3iI3TC3JYt$HgDN3LCwzkz84T+emqwXnoNz45/tU2F5kP4hrmHF13U=',NULL,0,'onostudent','One','Stud',0,1,'2025-05-06 08:26:53.778611','studentone.sjc@phinmaed.com',NULL,0,NULL),(24,'pbkdf2_sha256$870000$sQXxJFDw1QJDQMnirmh80J$JgZYpvQCVxXjiTRiUvBjTKQe8CAf8bGD7I/lNK2EHjs=',NULL,0,'Marc.Polo','Marco Polo','Igon-igon',0,1,'2025-06-16 03:46:46.000000','Marc.sjc@phinmaed.ocm',NULL,0,''),(25,'pbkdf2_sha256$870000$skGhClnrpSpDWaqqZey96J$sXCRpaIc1CAKkzr6qeggGAas1yt4zx7dwTdiUWg/Kc8=',NULL,1,'atilia','Martin','Espineda',1,1,'2025-06-25 06:03:33.000000','maor.espineda.sjc@phinmaed.com',NULL,0,''),(26,'pbkdf2_sha256$870000$OMmjpPuxXFFUkwgDnqoIB0$EqUOZY5JW4vWV+k0+mvlzeCcYbCUtK9cpQh4RKE2KTs=',NULL,0,'LauPa','Laurena','Pasana',0,1,'2025-07-01 09:06:14.000000','Lau.Pasana.sjc@phinmaed.com',4,0,''),(27,'pbkdf2_sha256$870000$OnPekFBrI2vDatAsANnChD$c1c0tN8x/W1f6LPUtQgIIw/6Z5BIO+WToQKBFturOsY=',NULL,0,'TejDen','Tejada','Denver',0,1,'2025-07-01 09:08:37.000000','Tej.Denver.sjc@phinmaed.com',4,0,''),(28,'pbkdf2_sha256$870000$tlcvLSdT6lGwm2tOkZqSvI$5tp+3gMVAWAubUztz9JCDypcnRAO4hon4tIqdyUjEn8=',NULL,0,'Ramon','Ramon','Brinquez',0,1,'2025-07-10 08:34:22.141073','Ravi.Brinquez.sjc@phinmaed.com',NULL,0,''),(30,'pbkdf2_sha256$870000$LXeAnApFbh7oI27boVM0OE$MpNFfzDdM7TBKu1waQkr29jkBKBGVuJOGgsUNoSPDT8=','2025-07-10 09:18:43.107373',1,'admin','','',1,1,'2025-07-10 09:18:05.480355','pushitrash@yahoo.com',NULL,0,'');

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

) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrapp_user_groups`
--

LOCK TABLES `hrapp_user_groups` WRITE;
/*!40000 ALTER TABLE `hrapp_user_groups` DISABLE KEYS */;

INSERT INTO `hrapp_user_groups` VALUES (23,1,2),(13,3,4),(26,4,4),(6,5,1),(7,6,1),(11,7,4),(12,8,2),(21,16,1),(24,18,1),(25,19,1),(33,24,4),(37,25,5),(35,26,1),(36,27,1),(38,28,1),(39,30,1);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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


-- Dump completed on 2025-07-16 13:44:48

