import React from 'react';
import {
  Sun,
  Moon,
  Menu,
  Search,
  X,
  ChevronDown,
  User,
  ExternalLink,
  Eye,
  EyeOff,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  LucideProps,
} from 'lucide-react';

const iconMap = {
  sun: Sun,
  moon: Moon,
  menu: Menu,
  search: Search,
  close: X,
  x: X,
  'chevron-down': ChevronDown,
  chevrondown: ChevronDown,
  user: User,
  'external-link': ExternalLink,
  externallink: ExternalLink,
  eye: Eye,
  'eye-off': EyeOff,
  eyeoff: EyeOff,
  mail: Mail,
  lock: Lock,
  'check-circle': CheckCircle,
  checkcircle: CheckCircle,
  'alert-circle': AlertCircle,
  alertcircle: AlertCircle,
} as const;

export type IconName = keyof typeof iconMap;

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName | string;
  size?: number | string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  ...props
}) => {
  const normalizedKey = name.toLowerCase().trim() as keyof typeof iconMap;
  const Component = iconMap[normalizedKey];

  if (!Component) {
    console.warn(`[Icon] Warning: Icon "${name}" is not registered in icons.tsx`);
    return null;
  }

  return <Component size={size} className={className} {...props} />;
};

export default Icon;
