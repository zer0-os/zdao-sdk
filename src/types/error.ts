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

class NotSyncStateError extends ZDAOError {
  constructor() {
    super(errorMessageForError('not-sync-state'), 'NotStateSyncError');
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

class AlreadyExistError extends ZDAOError {
  constructor(message: string) {
    super(message, 'AlreadyExistError');
  }
}

class InvalidError extends ZDAOError {
  constructor(message: string) {
    super(message, 'InvalidError');
  }
}

export {
  AlreadyExistError,
  FailedTxError,
  InvalidError,
  NotFoundError,
  NotImplementedError,
  NotSyncStateError,
  ZDAOError,
};
