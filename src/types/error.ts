import { errorMessageForError } from '../utilities/messages';

class ZDAOError extends Error {
  name: string;

  constructor(message: string, name?: string) {
    super(message);
    this.name = name ?? 'ZDAOError';
  }
}

class InvalidSignerError extends ZDAOError {
  constructor() {
    super(errorMessageForError('no-found-signer'), 'InvalidSignerError');
  }
}

class NotImplementedError extends ZDAOError {
  constructor() {
    super(errorMessageForError('not-implemented'), 'FailedTxError');
  }
}

class NotInitializedError extends ZDAOError {
  constructor() {
    super(errorMessageForError('not-initialized'), 'NotInitializedError');
  }
}

class NotSyncStateError extends ZDAOError {
  constructor() {
    super(errorMessageForError('not-sync-state'), 'NotStateSyncError');
  }
}

class NetworkError extends ZDAOError {
  constructor(message: string) {
    super(message, 'NetworkError');
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

class AlreadyDestroyedError extends ZDAOError {
  constructor() {
    super(errorMessageForError('already-destroyed'), 'AlreadyDestroyedError');
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

class UnknownError extends ZDAOError {
  constructor(message: string) {
    super(message, 'UnknownError');
  }
}

export {
  AlreadyDestroyedError,
  AlreadyExistError,
  FailedTxError,
  InvalidError,
  InvalidSignerError,
  NetworkError,
  NotFoundError,
  NotImplementedError,
  NotInitializedError,
  NotSyncStateError,
  UnknownError,
  ZDAOError,
};
