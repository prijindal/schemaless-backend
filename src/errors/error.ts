import type { HttpStatusCodeLiteral } from "tsoa";

// TODO: extend customerror from error
export class CustomError {
  public class_name: string;
  constructor(
    public status_code: number,
    public message: string,
    public details?: string
  ) {
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
