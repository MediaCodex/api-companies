import { customAlphabet } from 'nanoid';
import { nolookalikes } from 'nanoid-dictionary';
import LeoProfanity from 'leo-profanity';

export const safeNanoid = (length: number = 10, attempts: number = 5) => {
  let currentAttempt = 1;
  let result = '';

  // try to gen id
  while (currentAttempt <= attempts && result === '') {
    const id = customAlphabet(nolookalikes)(length);
    if (!LeoProfanity.check(id)) {
      result = id;
    }
  }

  // ran out of attempts
  if (!result) {
    throw new Error('Failed to generate ID');
  }

  return result;
};
