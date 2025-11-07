"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp@1.4.2";
import { MinusIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function InputOTP({
  className,
  containerClassName,
  ...props
} ) {
  return (
    
  );
}

function InputOTPGroup({ className, ...props }) {
  return (
    
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
} ) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    
      {char}
      {hasFakeCaret && (
        
          
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }) {
  return (
    
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
