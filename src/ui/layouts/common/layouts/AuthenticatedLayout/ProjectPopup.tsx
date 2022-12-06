/* eslint-disable */
import React, { useState } from 'react';
import { toasterTypes } from '../../../../../constants';
import { showToasterAction } from '../../../../../redux/actions';
import {
  Box,
  FlexBox,
  FormTextField,
  H3,
  GhostButton,
  PrimaryButton,
} from '../../../../components';
import { useSelector, useDispatch } from '../../../../hooks';
import { Popup } from '../../../common/Popup';
import { projectsActions } from '../../../../../redux/actions';
import { sessionSelectors } from '../../../../../redux/selectors';
import axios from 'axios';

export const ProjectPopup: React.FC<{
  setPopupOpen: (attr: boolean) => void;
}> = ({ setPopupOpen }) => {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const dispatch = useDispatch();
  const authToken = useSelector(sessionSelectors.authenticationToken);

  const handleCreateProject = async () => {
      setSubmitting(true);
      await axios.post(`${process.env.REACT_APP_BASE_API_URL}/projects`, { name, description }, { headers: { Authorization: `Bearer ${authToken}` }})
            .then(async () => {
              await dispatch(projectsActions.getMy({ selectDefault: false }));
              setSubmitting(false);
              setPopupOpen(false)
            }).catch(async (errorText) => {
              await dispatch(
                  showToasterAction({
                    description: errorText.message, 
                    type: toasterTypes.failure,
                  }),
                );
                setSubmitting(false);
                setPopupOpen(false)
            });
    }


  return (
    <Popup
      onClose={() => {
        setPopupOpen(false);
      }}
    >
      <FlexBox.Row alignItems="center" justifyContent="space-between">
        <H3 bold color="darkGrey">Create a project</H3>
      </FlexBox.Row>
        
      <Box>
        <Box marginTop="md" >
          <FormTextField
            label='Project Name'
            labelColor="#000"
            placeholder='Project Name'
            value={name}
            onChange={(val: string) => setName(val)}
            error={{
              hasError: false,
              text: '',
            }}
            type='textarea'
          />
        </Box>
        <Box marginTop="md" style={{ width: '100%' }}>
          <FormTextField
              label='Project Description'
              labelColor="#000"
              placeholder='Project Description'
              value={description}
              onChange={(val: string) => setDescription(val)}
              error={{
                hasError: false,
                text: '',
              }}
            />
        </Box>

        <FlexBox justifyContent="end" marginTop="md" flexWrap>
          <Box marginRight="sm" marginBottom="md">
            <GhostButton onClick={() => setPopupOpen(false)}>
              Cancel
            </GhostButton>
          </Box>
          <Box marginLeft="sm" marginRight="sm" marginBottom="md">
            <PrimaryButton
              disabled={submitting}
              loading={submitting}
              onClick={handleCreateProject}
            >Create
            </PrimaryButton>
          </Box>
        </FlexBox>
        
      </Box>
    </Popup>
  );
};