export class ErrorsNotification<T = null> {
  messages: {
    message: string;
    key: string;
  }[] = [];
  code = 0;
  data: T | null = null;

  constructor(data: T | null = null) {
    this.data = data;
  }

  hasError() {
    return this.code !== 0;
  }

  addError(message: string, key: string, code: number | null = null) {
    this.code = code ?? 1;
    this.messages.push({ message, key });
  }

  addData(data: T) {
    this.data = data;
  }
}
