import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { db } from '../prisma/db.js';

@Injectable()
export class LibraryService {
  // POST /library/books
  createBook(dto: any, currentUser: any) {
    return db.orm.public.Book.create({
      schoolId: dto.schoolId ?? currentUser.schoolId,
      title: dto.title,
      author: dto.author,
      isbn: dto.isbn,
      category: dto.category,
      barcode: dto.barcode,
      quantity: dto.quantity ?? 1,
      availableQty: dto.quantity ?? 1,
      digitalUrl: dto.digitalUrl,
    });
  }

  // GET /library/books
  getBooks(currentUser: any) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return db.orm.public.Book.all();
    }
    return db.orm.public.Book.where({ schoolId: currentUser.schoolId }).all();
  }

  // GET /library/books/:id
  async getBook(id: number) {
    const book = await db.orm.public.Book.where({ id }).first();
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  // PATCH /library/books/:id
  async updateBook(id: number, dto: any) {
    await this.getBook(id);
    await db.orm.public.Book.where({ id }).update({ ...dto });
    return this.getBook(id);
  }

  // DELETE /library/books/:id
  async deleteBook(id: number) {
    await this.getBook(id);
    await db.orm.public.Book.where({ id }).delete();
    return { message: 'Book deleted successfully' };
  }

  // POST /library/issues
  async issueBook(dto: any) {
    const book = await this.getBook(dto.bookId);

    if (book.availableQty <= 0) {
      throw new BadRequestException('No copies of this book are available');
    }

    await db.orm.public.Book
      .where({ id: book.id })
      .update({ availableQty: book.availableQty - 1 });

    return db.orm.public.BookIssue.create({
      bookId: book.id,
      studentId: dto.studentId,
      issueDate: dto.issueDate ?? new Date().toISOString(),
      status: 'ISSUED',
    });
  }

  // GET /library/issues
  getIssues() {
    return db.orm.public.BookIssue.all();
  }

  // PATCH /library/issues/:id/return
  async returnBook(id: number, fine?: number) {
    const issue = await db.orm.public.BookIssue.where({ id }).first();

    if (!issue) {
      throw new NotFoundException('Book issue not found');
    }

    await db.orm.public.BookIssue.where({ id }).update({
      status: 'RETURNED',
      returnDate: new Date().toISOString(),
      fine: fine ?? 0,
    });

    const book = await db.orm.public.Book.where({ id: issue.bookId }).first();

    if (book) {
      await db.orm.public.Book
        .where({ id: book.id })
        .update({ availableQty: book.availableQty + 1 });
    }

    if (fine && fine > 0) {
      await db.orm.public.LibraryFine.create({
        issueId: issue.id,
        amount: fine,
      });
    }

    return db.orm.public.BookIssue.where({ id }).first();
  }

  // GET /library/fines
  getFines() {
    return db.orm.public.LibraryFine.all();
  }

  // PATCH /library/fines/:id
  async updateFine(id: number, dto: any) {
    const fine = await db.orm.public.LibraryFine.where({ id }).first();

    if (!fine) {
      throw new NotFoundException('Fine not found');
    }

    const paidAmount = dto.paidAmount ?? fine.paidAmount;

    await db.orm.public.LibraryFine.where({ id }).update({
      paidAmount,
      isPaid: paidAmount >= fine.amount,
    });

    return db.orm.public.LibraryFine.where({ id }).first();
  }
}
