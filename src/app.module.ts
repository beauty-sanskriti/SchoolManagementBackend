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
@Module({
  imports: [
    UsersModule,
    SchoolsModule,
    AuthModule,
    StudentsModule,
    AdmissionsModule,
    TeachersModule,
    TimetableModule,

    AcademicYearsModule,
    CampusesModule,
    DepartmentsModule,
    ClassesModule,
    SectionsModule,
    SubjectsModule,

  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,
  ],
})
export class AppModule {}