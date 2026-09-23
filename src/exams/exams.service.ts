import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';
import { CreateExamDto } from './dto/create-exam.dto.js';
import { UpdateExamDto } from './dto/update-exam.dto.js';
import { CreateExamSubjectDto } from './dto/create-exam-subject.dto.js';
import { UpdateExamSubjectDto } from './dto/update-exam-subject.dto.js';
import { CreateQuestionDto } from './dto/create-question.dto.js';
import { UpdateQuestionDto } from './dto/update-question.dto.js';
import { SubmitExamDto } from './dto/submit-exam.dto.js';
import { CreateResultDto } from './dto/create-result.dto.js';
import { UpdateResultDto } from './dto/update-result.dto.js';

@Injectable()
export class ExamsService {
  private getSchoolId(user: any): number {
    const schoolId = Number(user?.schoolId);

    if (!schoolId) {
      throw new ForbiddenException('School access required');
    }

    return schoolId;
  }

  private async getExam(id: number, schoolId: number) {
    const exam = await db.orm.public.Exam.where({ id }).first();

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.schoolId !== schoolId) {
      throw new ForbiddenException('Exam does not belong to your school');
    }

    return exam;
  }

  private async getStudent(studentId: number, schoolId: number) {
    const student = await db.orm.public.Student.where({
      id: studentId,
    }).first();

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.schoolId !== schoolId) {
      throw new ForbiddenException('Student does not belong to your school');
    }

    return student;
  }

  private async getSubject(subjectId: number) {
    const subject = await db.orm.public.Subject.where({
      id: subjectId,
    }).first();

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  async createExam(dto: CreateExamDto, user: any) {
    const schoolId = this.getSchoolId(user);

    if (dto.schoolId !== schoolId) {
      throw new ForbiddenException('School access denied');
    }

    if (dto.startDate && dto.endDate && dto.startDate > dto.endDate) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    return db.orm.public.Exam.create({
      schoolId,
      name: dto.name,
      description: dto.description,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: dto.status ?? 'DRAFT',
    });
  }

  async findAllExams(user: any) {
    const schoolId = this.getSchoolId(user);

    return db.orm.public.Exam.where({ schoolId }).all();
  }

  async findOneExam(id: number, user: any) {
    const schoolId = this.getSchoolId(user);

    return this.getExam(id, schoolId);
  }

  async updateExam(id: number, dto: UpdateExamDto, user: any) {
    const schoolId = this.getSchoolId(user);
    const exam = await this.getExam(id, schoolId);

    const startDate = dto.startDate ?? exam.startDate ?? undefined;
    const endDate = dto.endDate ?? exam.endDate ?? undefined;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    return db.orm.public.Exam.where({ id }).update({
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && {
        description: dto.description,
      }),
      ...(dto.startDate !== undefined && { startDate: dto.startDate }),
      ...(dto.endDate !== undefined && { endDate: dto.endDate }),
      ...(dto.status !== undefined && { status: dto.status }),
    });
  }

  async deleteExam(id: number, user: any) {
    const schoolId = this.getSchoolId(user);
    await this.getExam(id, schoolId);

    const subjects = await db.orm.public.ExamSubject.where({
      examId: id,
    }).all();

    for (const subject of subjects) {
      await db.orm.public.ExamSubject.where({
        id: subject.id,
      }).delete();
    }

    const questions = await db.orm.public.Question.where({
      examId: id,
    }).all();

    for (const question of questions) {
      await db.orm.public.Question.where({
        id: question.id,
      }).delete();
    }

    const attempts = await db.orm.public.ExamAttempt.where({
      examId: id,
    }).all();

    for (const attempt of attempts) {
      const answers = await db.orm.public.ExamAnswer.where({
        attemptId: attempt.id,
      }).all();

      for (const answer of answers) {
        await db.orm.public.ExamAnswer.where({
          id: answer.id,
        }).delete();
      }

      await db.orm.public.ExamAttempt.where({
        id: attempt.id,
      }).delete();
    }

    const results = await db.orm.public.Result.where({
      examId: id,
    }).all();

    for (const result of results) {
      await db.orm.public.Result.where({
        id: result.id,
      }).delete();
    }

    return db.orm.public.Exam.where({ id }).delete();
  }

  async addSubject(
    examId: number,
    dto: CreateExamSubjectDto,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);
    await this.getExam(examId, schoolId);

    const subject = await this.getSubject(dto.subjectId);

    if (subject.schoolId !== schoolId) {
      throw new ForbiddenException('Subject does not belong to your school');
    }

    if (dto.maxMarks <= 0 || dto.passMarks < 0) {
      throw new BadRequestException('Invalid marks');
    }

    if (dto.passMarks > dto.maxMarks) {
      throw new BadRequestException(
        'Pass marks cannot be greater than max marks',
      );
    }

    const existing = await db.orm.public.ExamSubject.where({
      examId,
      subjectId: dto.subjectId,
    }).first();

    if (existing) {
      throw new BadRequestException('Subject already added to this exam');
    }

    return db.orm.public.ExamSubject.create({
      examId,
      subjectId: dto.subjectId,
      maxMarks: dto.maxMarks,
      passMarks: dto.passMarks,
    });
  }

  async getSubjects(examId: number, user: any) {
    const schoolId = this.getSchoolId(user);
    await this.getExam(examId, schoolId);

    return db.orm.public.ExamSubject.where({ examId }).all();
  }

  async updateSubject(
    examId: number,
    subjectId: number,
    dto: UpdateExamSubjectDto,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);
    await this.getExam(examId, schoolId);

    const examSubject = await db.orm.public.ExamSubject.where({
      id: subjectId,
    }).first();

    if (!examSubject || examSubject.examId !== examId) {
      throw new NotFoundException('Exam subject not found');
    }

    if (dto.subjectId !== undefined) {
      const subject = await this.getSubject(dto.subjectId);

      if (subject.schoolId !== schoolId) {
        throw new ForbiddenException(
          'Subject does not belong to your school',
        );
      }
    }

    const maxMarks = dto.maxMarks ?? examSubject.maxMarks;
    const passMarks = dto.passMarks ?? examSubject.passMarks;

    if (maxMarks <= 0 || passMarks < 0 || passMarks > maxMarks) {
      throw new BadRequestException('Invalid marks');
    }

    return db.orm.public.ExamSubject.where({ id: subjectId }).update({
      ...(dto.subjectId !== undefined && { subjectId: dto.subjectId }),
      ...(dto.maxMarks !== undefined && { maxMarks: dto.maxMarks }),
      ...(dto.passMarks !== undefined && { passMarks: dto.passMarks }),
    });
  }

  async deleteSubject(
    examId: number,
    subjectId: number,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);
    await this.getExam(examId, schoolId);

    const examSubject = await db.orm.public.ExamSubject.where({
      id: subjectId,
    }).first();

    if (!examSubject || examSubject.examId !== examId) {
      throw new NotFoundException('Exam subject not found');
    }

    return db.orm.public.ExamSubject.where({
      id: subjectId,
    }).delete();
  }

  async addQuestion(
    examId: number,
    dto: CreateQuestionDto,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);
    await this.getExam(examId, schoolId);

    const subject = await this.getSubject(dto.subjectId);

    if (subject.schoolId !== schoolId) {
      throw new ForbiddenException('Subject does not belong to your school');
    }

    const examSubject = await db.orm.public.ExamSubject.where({
      examId,
      subjectId: dto.subjectId,
    }).first();

    if (!examSubject) {
      throw new BadRequestException(
        'Subject must be added to the exam before adding questions',
      );
    }

    if (dto.marks <= 0) {
      throw new BadRequestException('Question marks must be greater than 0');
    }

    return db.orm.public.Question.create({
      examId,
      subjectId: dto.subjectId,
      question: dto.question,
      type: dto.type,
      marks: dto.marks,
      options: dto.options,
      answer: dto.answer,
    });
  }

  async getQuestions(examId: number, user: any) {
    const schoolId = this.getSchoolId(user);
    await this.getExam(examId, schoolId);

    return db.orm.public.Question.where({ examId }).all();
  }

  async updateQuestion(
    examId: number,
    questionId: number,
    dto: UpdateQuestionDto,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);
    await this.getExam(examId, schoolId);

    const question = await db.orm.public.Question.where({
      id: questionId,
    }).first();

    if (!question || question.examId !== examId) {
      throw new NotFoundException('Question not found');
    }

    if (dto.subjectId !== undefined) {
      const subject = await this.getSubject(dto.subjectId);

      if (subject.schoolId !== schoolId) {
        throw new ForbiddenException(
          'Subject does not belong to your school',
        );
      }

      const examSubject = await db.orm.public.ExamSubject.where({
        examId,
        subjectId: dto.subjectId,
      }).first();

      if (!examSubject) {
        throw new BadRequestException(
          'Subject must be added to the exam',
        );
      }
    }

    return db.orm.public.Question.where({ id: questionId }).update({
      ...(dto.subjectId !== undefined && { subjectId: dto.subjectId }),
      ...(dto.question !== undefined && { question: dto.question }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.marks !== undefined && { marks: dto.marks }),
      ...(dto.options !== undefined && { options: dto.options }),
      ...(dto.answer !== undefined && { answer: dto.answer }),
    });
  }

  async deleteQuestion(
    examId: number,
    questionId: number,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);
    await this.getExam(examId, schoolId);

    const question = await db.orm.public.Question.where({
      id: questionId,
    }).first();

    if (!question || question.examId !== examId) {
      throw new NotFoundException('Question not found');
    }

    const answers = await db.orm.public.ExamAnswer.where({
      questionId,
    }).all();

    for (const answer of answers) {
      await db.orm.public.ExamAnswer.where({
        id: answer.id,
      }).delete();
    }

    return db.orm.public.Question.where({
      id: questionId,
    }).delete();
  }

  async startExam(examId: number, user: any) {
    const schoolId = this.getSchoolId(user);
    const exam = await this.getExam(examId, schoolId);

    const studentId = Number(user?.studentId ?? user?.id);

    if (!studentId) {
      throw new BadRequestException('Student ID is required');
    }

    await this.getStudent(studentId, schoolId);

    if (!['SCHEDULED', 'LIVE'].includes(exam.status)) {
      throw new BadRequestException(
        'Exam cannot be started in its current status',
      );
    }

    const existing = await db.orm.public.ExamAttempt.where({
      examId,
      studentId,
    }).first();

    if (existing && !existing.submittedAt) {
      return existing;
    }

    return db.orm.public.ExamAttempt.create({
      examId,
      studentId,
      startedAt: new Date().toISOString(),
    });
  }

  async submitExam(
    examId: number,
    dto: SubmitExamDto,
    user: any,
  ) {
    const schoolId = this.getSchoolId(user);
    await this.getExam(examId, schoolId);

    const studentId = Number(user?.studentId ?? user?.id);

    if (!studentId) {
      throw new BadRequestException('Student ID is required');
    }

    await this.getStudent(studentId, schoolId);

    const attempt = await db.orm.public.ExamAttempt.where({
      id: dto.attemptId,
    }).first();

    if (!attempt || attempt.examId !== examId || attempt.studentId !== studentId) {
      throw new NotFoundException('Exam attempt not found');
    }

    if (attempt.submittedAt) {
      throw new BadRequestException('Exam already submitted');
    }

    const questions = await db.orm.public.Question.where({
      examId,
    }).all();

    const questionMap = new Map(
      questions.map((question) => [question.id, question]),
    );

    for (const answer of dto.answers) {
      const question = questionMap.get(answer.questionId);

      if (!question) {
        throw new BadRequestException(
          `Question ${answer.questionId} does not belong to this exam`,
        );
      }

      const existingAnswer = await db.orm.public.ExamAnswer.where({
        attemptId: attempt.id,
        questionId: answer.questionId,
      }).first();

      if (existingAnswer) {
        await db.orm.public.ExamAnswer.where({
          id: existingAnswer.id,
        }).update({
          answer: answer.answer,
          marks:
            question.answer !== undefined &&
            question.answer !== null &&
            answer.answer === question.answer
              ? question.marks
              : 0,
        });
      } else {
        await db.orm.public.ExamAnswer.create({
          attemptId: attempt.id,
          questionId: answer.questionId,
          answer: answer.answer,
          marks:
            question.answer !== undefined &&
            question.answer !== null &&
            answer.answer === question.answer
              ? question.marks
              : 0,
        });
      }
    }

    const submittedAt = new Date().toISOString();

    const updatedAttempt = await db.orm.public.ExamAttempt.where({
      id: attempt.id,
    }).update({
      submittedAt,
    });

    const allAnswers = await db.orm.public.ExamAnswer.where({
      attemptId: attempt.id,
    }).all();

    const totalMarks = allAnswers.reduce(
      (sum, answer) => sum + Number(answer.marks ?? 0),
      0,
    );

    const existingResult = await db.orm.public.Result.where({
      examId,
      studentId,
      subjectId: undefined,
    }).first();

    let result;

    if (existingResult) {
      result = await db.orm.public.Result.where({
        id: existingResult.id,
      }).update({
        marks: totalMarks,
      });
    } else {
      result = await db.orm.public.Result.create({
        examId,
        studentId,
        marks: totalMarks,
        remarks: 'Auto-generated from exam submission',
      });
    }

    return {
      attempt: updatedAttempt,
      result,
      totalMarks,
    };
  }

  async getExamResult(examId: number, user: any) {
    const schoolId = this.getSchoolId(user);
    await this.getExam(examId, schoolId);

    const studentId = Number(user?.studentId ?? user?.id);

    if (!studentId) {
      throw new BadRequestException('Student ID is required');
    }

    await this.getStudent(studentId, schoolId);

    const result = await db.orm.public.Result.where({
      examId,
      studentId,
    }).all();

    return result;
  }

  async createResult(dto: CreateResultDto, user: any) {
    const schoolId = this.getSchoolId(user);

    await this.getExam(dto.examId, schoolId);
    await this.getStudent(dto.studentId, schoolId);

    if (dto.subjectId !== undefined) {
      const subject = await this.getSubject(dto.subjectId);

      if (subject.schoolId !== schoolId) {
        throw new ForbiddenException(
          'Subject does not belong to your school',
        );
      }
    }

    return db.orm.public.Result.create({
      examId: dto.examId,
      studentId: dto.studentId,
      subjectId: dto.subjectId,
      marks: dto.marks,
      grade: dto.grade,
      remarks: dto.remarks,
    });
  }

  async findAllResults(user: any) {
    const schoolId = this.getSchoolId(user);

    const students = await db.orm.public.Student.where({
      schoolId,
    }).all();

    const studentIds = new Set(students.map((student) => student.id));

    const results = await db.orm.public.Result.all();

    return results.filter((result) => studentIds.has(result.studentId));
  }

  async findOneResult(id: number, user: any) {
    const schoolId = this.getSchoolId(user);

    const result = await db.orm.public.Result.where({
      id,
    }).first();

    if (!result) {
      throw new NotFoundException('Result not found');
    }

    await this.getStudent(result.studentId, schoolId);

    return result;
  }

  async updateResult(
    id: number,
    dto: UpdateResultDto,
    user: any,
  ) {
    await this.findOneResult(id, user);

    return db.orm.public.Result.where({ id }).update({
      ...(dto.marks !== undefined && { marks: dto.marks }),
      ...(dto.grade !== undefined && { grade: dto.grade }),
      ...(dto.remarks !== undefined && { remarks: dto.remarks }),
    });
  }

  async studentResults(studentId: number, user: any) {
    const schoolId = this.getSchoolId(user);

    await this.getStudent(studentId, schoolId);

    return db.orm.public.Result.where({
      studentId,
    }).all();
  }

  async reportCard(studentId: number, user: any) {
    const schoolId = this.getSchoolId(user);

    await this.getStudent(studentId, schoolId);

    const results = await db.orm.public.Result.where({
      studentId,
    }).all();

    return {
      studentId,
      results,
    };
  }

  // GET /results/:id/report
  async resultReport(id: number, user: any) {
    const result = await db.orm.public.Result.where({ id }).first();

    if (!result) {
      throw new NotFoundException('Result not found');
    }

    const exam = await db.orm.public.Exam.where({ id: result.examId }).first();
    const student = await db.orm.public.Student.where({ id: result.studentId }).first();

    return { result, exam, student };
  }

  // GET /results/analytics
  async resultsAnalytics(user: any) {
    const schoolId = this.getSchoolId(user);

    const exams = await db.orm.public.Exam.where({ schoolId }).all();
    const examIds = new Set(exams.map((e) => e.id));

    const allResults = await db.orm.public.Result.all();
    const results = allResults.filter((r) => examIds.has(r.examId));

    const avgMarks =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.marks, 0) / results.length
        : 0;

    return {
      totalResults: results.length,
      averageMarks: Math.round(avgMarks * 100) / 100,
    };
  }

  // GET /results/rankings
  async rankings(examId: number, user: any) {
    const schoolId = this.getSchoolId(user);

    const exam = await db.orm.public.Exam.where({ id: examId, schoolId }).first();

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const results = await db.orm.public.Result.where({ examId }).all();

    const sorted = [...results].sort((a, b) => b.marks - a.marks);

    return sorted.map((r, index) => ({
      rank: index + 1,
      studentId: r.studentId,
      marks: r.marks,
    }));
  }
}