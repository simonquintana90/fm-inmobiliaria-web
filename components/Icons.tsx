import React from 'react';
import { Icon } from '@iconify/react';

interface IconProps {
  className?: string;
}

export const LogoIcon: React.FC<IconProps> = ({ className }) => (
    <img src="https://cdn.prod.website-files.com/68026a0651df0f492c75ff17/691234088244dd37dbf626eb_FM%20Inm%20Logo.png" alt="FM Inversiones Inmobiliarias Logo" className={className} />
);

export const BedIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Icon icon="solar:bed-line-duotone" className={className} />
);

export const BathIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Icon icon="solar:bath-line-duotone" className={className} />
);

export const AreaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Icon icon="solar:ruler-cross-pen-line-duotone" className={className} />
);

export const GarageIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Icon icon="solar:garage-line-duotone" className={className} />
);

export const LocationIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Icon icon="solar:map-point-wave-line-duotone" className={className} />
);

export const CheckIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <Icon icon="solar:check-circle-bold" className={className} />
);

export const SearchIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Icon icon="solar:magnifer-line-duotone" className={className} />
);

export const ArrowRightIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <Icon icon="solar:arrow-right-line-duotone" className={className} />
);

export const BriefcaseIcon: React.FC<IconProps> = ({ className = "w-8 h-8" }) => (
  <Icon icon="solar:case-minimalistic-line-duotone" className={className} />
);

export const KeyIcon: React.FC<IconProps> = ({ className = "w-8 h-8" }) => (
  <Icon icon="solar:key-minimalistic-2-line-duotone" className={className} />
);

export const ChartBarIcon: React.FC<IconProps> = ({ className = "w-8 h-8" }) => (
  <Icon icon="solar:chart-2-line-duotone" className={className} />
);