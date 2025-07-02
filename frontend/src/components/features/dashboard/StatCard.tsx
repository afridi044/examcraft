import React from "react";

interface StatCardProps {
  icon?: React.ReactNode;
  iconBgClass?: string;
  value: string | number;
  label: string;
  sublabel?: string;
  subicon?: React.ReactNode;
  cardClass?: string;
  textClass?: string;
  sublabelClass?: string;
  rightIcon?: React.ReactNode;
  inlineSublabel?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconBgClass = "bg-white/15 border border-white/25",
  value,
  label,
  sublabel,
  subicon,
  cardClass = "",
  textClass = "",
  sublabelClass = "",
  rightIcon,
  inlineSublabel = false,
}) => (
  <div
    className={`relative overflow-hidden rounded-xl transition-all duration-300 group shadow-lg hover:shadow-xl ${cardClass}`}
    style={{
      boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
    }}
  >
    {/* Soft inner glow/vignette overlay */}
    <div className="pointer-events-none absolute inset-0 rounded-xl" style={{
      background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.18) 100%)',
      zIndex: 1,
      mixBlendMode: 'soft-light',
    }} />
    <div className="p-3 sm:p-4 md:p-6 relative z-10 flex flex-row items-center justify-between w-full">
      <div className="flex flex-col items-start text-left flex-1 justify-center">
        {icon && (
          <div
            className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-lg flex items-center justify-center mb-1 sm:mb-1.5 group-hover:bg-white/25 transition-colors ${iconBgClass}`}
          >
            {icon}
          </div>
        )}
        <div className="flex items-baseline flex-wrap">
          <p className={`font-semibold text-white mb-0.5 ${textClass} text-lg sm:text-xl md:text-2xl lg:text-3xl`}>
            {typeof value === 'string' && value.includes('%') ? (
              <>
                <span className="text-white font-semibold">
                  {value.replace(/%.*$/, '')}
                </span>
                <span className="ml-0.5 text-white/80 font-normal text-base sm:text-lg md:text-xl">%</span>
              </>
            ) : (
              value
            )}
            {inlineSublabel && sublabel && (
              <span className={`ml-1 align-baseline text-xs sm:text-sm text-white/70 ${sublabelClass}`}>{sublabel}</span>
            )}
          </p>
        </div>
        <p className="text-white/90 text-xs sm:text-sm md:text-base font-normal">{label}</p>
        {!inlineSublabel && sublabel && (
          <div className={`mt-1 sm:mt-1.5 flex items-center text-xs sm:text-sm ${sublabelClass}`}>
            {subicon && <span className="mr-1">{subicon}</span>}
            <span className="text-xs sm:text-sm">{sublabel}</span>
          </div>
        )}
      </div>
      {rightIcon && (
        <div className="ml-2 sm:ml-3 md:ml-4 flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg" style={{ background: 'rgba(255,255,255,0.10)' }}>
          {React.isValidElement(rightIcon)
            ? React.cloneElement(rightIcon as React.ReactElement<{ className?: string; color?: string }>, {
                className: `${(rightIcon as React.ReactElement<{ className?: string; color?: string }> ).props.className || ''} h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6`,
                color: '#fff',
              })
            : rightIcon}
        </div>
      )}
    </div>
  </div>
);
