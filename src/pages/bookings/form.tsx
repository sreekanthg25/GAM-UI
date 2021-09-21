import React, { FC, useEffect, useMemo } from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { useRecoilValue, useRecoilState } from 'Recoil';

import { Paper, Box, Stepper, Step, StepLabel, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Send as SendIcon } from '@mui/icons-material';

import { Breadcrumbs } from '@/components';
import { showSubmitButton, formStep, formSaving } from '@/recoil/atoms/bookingform';

import Booking from './booking';
import LineItem from './lineItem';

const steps = [
  { label: 'Create Booking', component: Booking, name: 'booking-form', type: 'submit' },
  { label: 'Create an line item', component: LineItem, name: 'line-item-form', type: 'submit' },
  { label: 'Create an Creatives', type: 'submit' },
];

const BookingForm: FC = () => {
  const [isActionSubmit, setActionFormSubmitState] = useRecoilState(showSubmitButton);
  const isSaving = useRecoilValue(formSaving);
  const [activeStep, setActiveStep] = useRecoilState(formStep);
  const currentStep = steps[activeStep];

  useEffect(() => {
    if (currentStep?.type === 'submit') {
      setActionFormSubmitState(true);
    }
  }, [currentStep, setActionFormSubmitState]);

  const handleNext = () => {
    setActiveStep((curVal) => curVal + 1);
  };
  const handleBack = () => {
    setActiveStep((curVal) => curVal - 1);
  };
  const StepComponent: React.ReactNode = useMemo(() => {
    const Comp = currentStep?.component;
    return Comp ? <Comp /> : <></>;
  }, [currentStep]);

  const renderStepperFooter = () => {
    const actionButton = isActionSubmit ? (
      <LoadingButton loading={isSaving} type="submit" form={currentStep.name} variant="contained">
        {`Save & Continue`}
      </LoadingButton>
    ) : (
      <Button variant="contained" endIcon={<SendIcon />} onClick={handleNext}>
        Next
      </Button>
    );
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Box>
          <Button onClick={handleBack} disabled={activeStep < 1 || isSaving} variant="outlined">
            Back
          </Button>
          <Button disabled={isSaving} component={RouteLink} to="/bookings" variant="outlined" sx={{ ml: 2 }}>
            Cancel
          </Button>
        </Box>
        <Box>{actionButton}</Box>
      </Box>
    );
  };

  return (
    <>
      <Breadcrumbs></Breadcrumbs>
      <Box sx={{ flexGrow: 1, maxWidth: 800, py: 4 }}>
        <Stepper activeStep={activeStep}>
          {steps.map(({ label }) => {
            return (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <Paper elevation={8} sx={{ p: 4, mt: 4 }}>
          {StepComponent}
        </Paper>
        {renderStepperFooter()}
      </Box>
    </>
  );
};

export default BookingForm;
