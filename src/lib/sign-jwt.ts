import { sign } from 'jsonwebtoken';
import { env } from '~/env';

export function signJWT(userId: string) {
  return sign({ id: userId }, env.AUTH_SECRET, {
    expiresIn: '1h',
  });
}
