import { errorMessageForError } from '../utilities/messages';

class ZDAOError extends Error {
  name: string;

  constructor(message: string, name?: string) {
    super(message);
    this.name = name ?? 'ZDAOError';
  }
}

class NotImplementedError extends ZDAOError {
  constructor() {
    super(errorMessageForError('not-implemented'), 'FailedTxError');
  }
}

class FailedTxError extends ZDAOError {
  constructor(message: string) {
    super(message, 'FailedTxError');
  }
}

class NotFoundError extends ZDAOError {
  constructor(message: string) {
    super(message, 'NotFoundError');
  }
}

class InvalidError extends ZDAOError {
  constructor(message: string) {
    super(message, 'InvalidError');
  }
}

export {
  FailedTxError,
  InvalidError,
  NotFoundError,
  NotImplementedError,
  ZDAOError,
};
