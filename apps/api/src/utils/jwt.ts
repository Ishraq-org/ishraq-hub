import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  role: string;
}

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || 'dev_jwt_secret_fallback_key_change_in_production';
};

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
};
