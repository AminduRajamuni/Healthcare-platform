# MySQL Installation & Setup Guide for Healthcare Platform

## Step 1: Download MySQL on Windows

### Option A: MySQL Community Server (Recommended)
1. Go to: https://dev.mysql.com/downloads/mysql/
2. Select **MySQL Community Server** → Latest version (8.0.x)
3. Download **Windows (x86, 64-bit), ZIP Archive** or **MSI Installer**

### Option B: MySQL Installer (Easiest for Beginners)
1. Go to: https://dev.mysql.com/downloads/windows/installer/
2. Download **MySQL Installer for Windows** (mysql-installer-community-X.X.X.msi)
3. Choose **web** version (smaller download, installs online) or **full** version

---

## Step 2: Install MySQL

### If using MSI Installer:
1. Double-click the `.msi` file
2. Click **Next** until you reach "MySQL Server Configuration"
3. Select:
   - **Config Type**: Development Machine
   - **MySQL Port**: 3306 (default)
   - **MySQL User**: root, **Password**: Password123@ ⚠️ (matches project config)
4. Click **Next** → **Finish**

### If using ZIP Archive:
1. Extract to `C:\mysql` (or your preferred location)
2. Open **Command Prompt as Administrator**
3. Run:
   ```cmd
   cd C:\mysql\bin
   mysqld --install MySQL80
   ```
4. Start MySQL service:
   ```cmd
   net start MySQL80
   ```

---

## Step 3: Verify MySQL Installation

Open **Command Prompt / PowerShell** and test the connection:

```cmd
mysql -u root -p
```

When prompted, enter password: `Password123@`

You should see:
```
Welcome to the MySQL monitor.  Commands end with ; or \g.
mysql>
```

Type `exit` to quit.

---

## Step 4: Create Databases for Each Service

Run these commands in MySQL to create all required databases:

```sql
CREATE DATABASE patient_db;
CREATE DATABASE doctor_db;
CREATE DATABASE appointment_db;
CREATE DATABASE payment_db;
CREATE DATABASE telemedicine_db;
CREATE DATABASE notification_db;
CREATE DATABASE admin_db;

-- Verify creation
SHOW DATABASES;
```

**Quick automation** - Save as `setup_databases.sql` and run:
```cmd
mysql -u root -p Password123@ < setup_databases.sql
```

---

## Step 5: Configure Project Connection Strings

All services already have the correct configuration. Verify each service's `application.properties` or `application.yml`:

### Patient Service
**File**: `patient-service/src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/patient_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=Password123@
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

### Doctor Service
**File**: `doctor-service/src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/doctor_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=Password123@
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
```

*(Continue for other services: appointment_db, payment_db, telemedicine_db)*

---

## Step 6: Test Connection with MySQL Workbench (Optional)

1. Download **MySQL Workbench** from: https://dev.mysql.com/downloads/workbench/
2. Install it
3. Create a new connection:
   - **Connection Name**: Healthcare Local
   - **Hostname**: localhost
   - **Port**: 3306
   - **Username**: root
   - **Password**: Password123@
4. Click **Test Connection**
5. You should see ✅ Connection Successful

---

## Step 7: Start All Services

### In Order:
1. Ensure MySQL is running:
   ```cmd
   net query MySQL80  # Windows
   # Or check Task Manager → Services → MySQL80
   ```

2. Start API Gateway:
   ```cmd
   cd api-gateway
   ./mvnw spring-boot:run
   ```

3. Start other services in separate terminals:
   ```cmd
   # Terminal 2
   cd patient-service
   ./mvnw spring-boot:run
   
   # Terminal 3
   cd doctor-service
   ./mvnw spring-boot:run
   
   # Continue for other services...
   ```

---

## Step 8: Verify Everything Works

### Check if services are running:
```cmd
curl http://localhost:8084/health  # Gateway health check
```

### Check database connection in logs:
Look for messages like:
```
com.zaxxer.hikari.HikariDataSource : HikariPool-1 - Starting...
com.zaxxer.hikari.HikariDataSource : HikariPool-1 - Driver does not support getting auto-committed settings...
```

---

## Troubleshooting

### ❌ "Error connecting to localhost:3306"
- Check if MySQL service is running
- Windows: Open Services app → Find "MySQL80" → Start it
- Or run: `net start MySQL80`

### ❌ "Access denied for user 'root'@'localhost'"
- Wrong password. Ensure you're using: `Password123@`
- Reset password (see next section)

### ❌ "Can't connect to MySQL server" (port error)
- MySQL might be using a different port (not 3306)
- Check: `SHOW GLOBAL VARIABLES LIKE 'port';` in MySQL CLI

### ❌ Database already exists error
- Drop and recreate: `DROP DATABASE patient_db; CREATE DATABASE patient_db;`

---

## Reset MySQL Password (if you forgot it)

1. Stop MySQL service:
   ```cmd
   net stop MySQL80
   ```

2. Start with `--skip-grant-tables`:
   ```cmd
   mysqld --skip-grant-tables
   ```

3. In another terminal, connect without password:
   ```cmd
   mysql -u root
   ```

4. Reset password:
   ```sql
   FLUSH PRIVILEGES;
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'Password123@';
   EXIT;
   ```

5. Restart MySQL normally:
   ```cmd
   net stop MySQL80
   net start MySQL80
   ```

---

## Check Current Configuration

Run this in MySQL to verify your setup:

```sql
-- Check MySQL version
SELECT VERSION();

-- Check current databases
SHOW DATABASES;

-- Check user privileges
SELECT USER();

-- Check MySQL port
SHOW GLOBAL VARIABLES LIKE 'port';

-- Check max connections
SHOW GLOBAL VARIABLES LIKE 'max_connections';
```

---

## Next Steps After Setup

1. ✅ MySQL installed & running
2. ✅ Databases created
3. ✅ Services configured with connection strings
4. 🔄 Start all microservices
5. 🔄 Start Apache Kafka (if needed for notifications)
6. 🔄 Start frontend (npm run dev)

**Happy coding! 🚀**
