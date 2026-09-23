import { Module } from '@nestjs/common';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { UsersModule } from './users/users.module.js';
import { SchoolsModule } from './schools/schools.module.js';
import { AuthModule } from './auth/auth.module.js';

import { AcademicYearsModule } from './academics/academic-years/academic-years.module.js';
import { CampusesModule } from './academics/campuses/campuses.module.js';
import { DepartmentsModule } from './academics/departments/departments.module.js';
import { ClassesModule } from './academics/classes/classes.module.js';
import { SectionsModule } from './academics/sections/sections.module.js';
import { SubjectsModule } from './academics/subjects/subjects.module.js';
import { StudentsModule } from './students/students.module.js';
import { AdmissionsModule } from './admissions/admissions.module.js';
import { TeachersModule } from './teachers/teachers.module.js';
import { TimetableModule } from './timetable/timetable.module.js';
import { AttendanceModule } from './attendance/attendance.module.js';
import { ExamsModule } from './exams/exams.module.js';
import { FeesModule } from './fees/fees.module.js';
import { StudentPortalModule } from './student-portal/student-portal.module.js';

import { SuperAdminModule } from './super-admin/super-admin.module.js';
import { InvitesModule } from './invites/invites.module.js';
import { SchoolAdminsModule } from './school-admins/school-admins.module.js';
import { ParentsModule } from './parents/parents.module.js';
import { ParentPortalModule } from './parent-portal/parent-portal.module.js';
import { TeacherPortalModule } from './teacher-portal/teacher-portal.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { CommunicationModule } from './communication/communication.module.js';
import { LmsModule } from './lms/lms.module.js';
import { LibraryModule } from './library/library.module.js';
import { HostelModule } from './hostel/hostel.module.js';
import { TransportModule } from './transport/transport.module.js';
import { HrPayrollModule } from './hr-payroll/hr-payroll.module.js';
import { SubscriptionsModule } from './subscriptions/subscriptions.module.js';
import { ReportsAnalyticsModule } from './reports-analytics/reports-analytics.module.js';
import { AiModule } from './ai/ai.module.js';
import { SecurityModule } from './security/security.module.js';
import { SettingsModule } from './settings/settings.module.js';

@Module({
  imports: [
    UsersModule,
    SchoolsModule,
    AuthModule,
    StudentsModule,
    AdmissionsModule,
    TeachersModule,
    TimetableModule,
    AttendanceModule,
    ExamsModule,
    FeesModule,
    StudentPortalModule,

    AcademicYearsModule,
    CampusesModule,
    DepartmentsModule,
    ClassesModule,
    SectionsModule,
    SubjectsModule,

    SuperAdminModule,
    InvitesModule,
    SchoolAdminsModule,
    ParentsModule,
    ParentPortalModule,
    TeacherPortalModule,
    NotificationsModule,
    CommunicationModule,
    LmsModule,
    LibraryModule,
    HostelModule,
    TransportModule,
    HrPayrollModule,
    SubscriptionsModule,
    ReportsAnalyticsModule,
    AiModule,
    SecurityModule,
    SettingsModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,
  ],
})
export class AppModule {}
