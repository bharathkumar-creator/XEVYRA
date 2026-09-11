import { ValueObject } from '../common/entity.js';
import { DomainError, Result } from '../common/result.js';

export interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: EmailProps) {
    super(props);
  }

  public static create(email: string): Result<Email, DomainError> {
    if (!email || email.trim().length === 0) {
      return Result.fail(new DomainError('Email cannot be empty', 'INVALID_EMAIL'));
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return Result.fail(new DomainError(`Invalid email format: ${email}`, 'INVALID_EMAIL'));
    }

    return Result.ok(new Email({ value: trimmed }));
  }
}
