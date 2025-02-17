import type { HttpStatusCodeLiteral } from "tsoa";

export class CustomError extends Error {
  public class_name: string;
  constructor(
    public status_code: number,
    public message: string,
    public details?: string
  ) {
    super(message);
    this.class_name = this.constructor.name;
  }
}

export class UserUnauthorizedError extends CustomError {
  static status_code: HttpStatusCodeLiteral = 401;
  constructor(public message: string, public details?: string) {
    super(UserUnauthorizedError.status_code, message, details);
  }
}

export class InvalidCredentialsError extends CustomError {
  static status_code: HttpStatusCodeLiteral = 403;
  constructor(
    public message: string,
    public details: string = "Invalid Credentials"
  ) {
    super(InvalidCredentialsError.status_code, message, details);
  }
}

export class AlreadyExistsError extends CustomError {
  static status_code: HttpStatusCodeLiteral = 409;
  constructor(public message: string, public details?: string) {
    super(AlreadyExistsError.status_code, message, details);
  }
}

export class NotExistsError extends CustomError {
  static status_code: HttpStatusCodeLiteral = 404;
  constructor(public message: string, public details?: string) {
    super(AlreadyExistsError.status_code, message, details);
  }
}
