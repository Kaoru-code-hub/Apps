import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...rest }: Props) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  );
}
