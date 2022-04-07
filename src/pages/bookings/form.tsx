import React, { FC, useEffect, useMemo } from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { useRecoilValue, useRecoilState } from 'Recoil';

import { Paper, Box, Stepper, Step, StepLabel, Button, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Send as SendIcon, Save as SaveIcon, Home as HomeIcon, Done as DoneIcon } from '@mui/icons-material';

import { Breadcrumbs } from '@/components';
import { showSubmitButton, formStep, formSaving, stepCompleted } from '@/recoil/atoms/bookingform';

import Booking from './booking';
import LineItem from './lineItem';
import Creatives from './creatives';

const steps = [
  { label: 'Create Order', component: Booking, name: 'booking-form', type: 'submit' },
  { label: 'Create an line item', component: LineItem, name: 'line-item-form', type: 'submit' },
  { label: 'Create an Creatives', component: Creatives, name: 'creative-form', type: 'submit', actionText: 'Submit' },
];

const BookingForm: FC = () => {
  const [isActionSubmit, setActionFormSubmitState] = useRecoilState(showSubmitButton);
  const isSaving = useRecoilValue(formSaving);
  const [activeStep, setActiveStep] = useRecoilState(formStep);
  const [isStepCompleted, setStepCompleted] = useRecoilState(stepCompleted(activeStep));
  const currentStep = steps[activeStep];

  useEffect(() => {
    if (currentStep?.type === 'submit') {
      setActionFormSubmitState(true);
    }
  }, [currentStep, setActionFormSubmitState]);

  const handleNext = () => {
    setStepCompleted(true);
    setActiveStep((curVal) => curVal + 1);
  };
  const handleBack = () => {
    setActiveStep((curVal) => curVal - 1);
  };
  const StepComponent: React.ReactNode = useMemo(() => {
    const Comp = currentStep?.component;
    return Comp ? <Comp /> : <></>;
  }, [currentStep]);

  const renderSuccessfulSteps = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DoneIcon sx={{ mr: 2, color: 'success.dark', fontSize: 30 }} />
          <Typography variant="h5" component="h1">
            Successfully Submitted the Steps
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            component={RouteLink}
            startIcon={<HomeIcon />}
            to="/"
            aria-label="Go to Home"
            sx={{ ml: 3 }}
          >
            Home
          </Button>
        </Box>
      </Box>
    );
  };

  const renderFooterButton = () => {
    const actionButton =
      isActionSubmit && !isStepCompleted ? (
        <LoadingButton
          loading={isSaving}
          startIcon={<SaveIcon />}
          type="submit"
          form={currentStep.name}
          variant="contained"
        >
          {currentStep.actionText || `Save & Continue`}
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
          <Button disabled={isSaving} component={RouteLink} to="/orders" variant="outlined" sx={{ ml: 2 }}>
            Cancel
          </Button>
        </Box>
        <Box>{actionButton}</Box>
      </Box>
    );
  };

  const renderStepperFooter = () => {
    return activeStep < steps.length && renderFooterButton();
  };

  return (
    <Box>
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
          {activeStep === steps.length ? renderSuccessfulSteps() : StepComponent}
        </Paper>
        {renderStepperFooter()}
      </Box>
    </Box>
  );
};

export default BookingForm;
