/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable operator-linebreak */
/* eslint-disable consistent-return */
/* eslint-disable function-paren-newline */
import React from 'react';
import qs from 'qs';
import uniq from 'uid';
import { Block, Text, toastr, IconButton, Dialog, Button } from '..';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core';
import { AttachFile, Attachment, Close } from '@material-ui/icons';
import { DialogHeader, DialogContent, DialogActions } from '../dialog';
import ThemeContext from '../theme/ThemeContext';

const S3Uploader = ({
  dirname,
  ACL,
  signaxiosinstance,
  uploadaxiosinstance,
  input: { onChange, value },
  signurl,
  deleteurl,
  limit,
  maxSize,
  accept,
}) => {
  const { colors } = React.useContext(ThemeContext);
  const [fileList, setfileList] = React.useState(value || []);
  const [confirmdelete, setconfirmdelete] = React.useState(false);
  const [deleting, setdeleting] = React.useState(null);

  const elemId = uniq(5);

  React.useEffect(() => {
    onChange(fileList || []);
  }, [fileList, onChange]);

  React.useEffect(() => {
    if (deleting && confirmdelete) {
      signaxiosinstance()
        .post(deleteurl, { files: [deleting] })
        .then(({ data }) => {
          toastr.success(data.message);
          setfileList((files) => {
            if (files.length > 0) {
              const progressArray = files
                .map((obj) => {
                  if (obj.Location === deleting) {
                    return null;
                  }
                  return obj;
                })
                .filter(Boolean);
              return progressArray;
            }
          });
          setdeleting(null);
          setconfirmdelete(false);
        })
        .catch((error) => {
          const response = error.response || {};
          const data = response.data || {};
          toastr.error(data.message || data);
        });
    }
  }, [confirmdelete, deleting]);

  const onprogress = (progressEvent, url) => {
    setfileList((urls) => {
      if (urls.length > 0) {
        const progressArray = urls.map((obj) => {
          if (obj.signedUrl === url) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            return { ...obj, progress };
          }
          return obj;
        });
        return progressArray;
      }
      return urls;
    });
  };
  const onUploadFinish = (url) => {
    setfileList((urls) => {
      if (urls.length > 0) {
        const progressArray = urls.map((obj) => {
          if (obj.signedUrl === url) {
            const newobj = { ...obj, status: 'done' };
            delete newobj.signedUrl;
            delete newobj.progress;
            return { ...newobj };
          }
          return obj;
        });
        return progressArray;
      }
      return urls;
    });
  };
  const handleFiles = async (event) => {
    const { files } = event.target;
    if (limit && files.length + fileList.length > limit) {
      return toastr.error(`Only a maximum of ${limit} files allowed`);
    }
    if (maxSize && maxSize > 0) {
      const sizelimit = Number(maxSize * 1024 * 1024);
      const inds = [...(files || [])]
        .map((file, index) => (file.size > sizelimit ? index + 1 : null))
        .filter(Boolean);
      if (inds.length > 0) {
        return toastr.error(
          `File "${
            files[inds[0] - 1].name
          }" exceeds ${maxSize}MB. Please try again with a smaller file`
        );
      }
    }
    const fileArray = [...(files || [])].map((file) => ({
      name: file.name.replace(/[^\w\d_\-.]+/gi, ''),
      type: file.type,
      size: file.size,
    }));

    if (fileArray.length > 0) {
      const signedUrls = await getSignedUrl(fileArray).then((urls) => urls);
      const uploads = [...(files || [])].map(
        (file) =>
          signedUrls
            .map(({ signedUrl, filename }) => {
              if (filename === file.name.replace(/[^\w\d_\-.]+/gi, '')) {
                return {
                  signedUrl,
                  file,
                  options: {
                    headers: {
                      'Content-Type': qs.parse(signedUrl)['Content-Type'],
                      Expires: qs.parse(signedUrl).Expires,
                      'x-amz-acl':
                        qs.parse(signedUrl)['x-amz-acl'] || 'public-read',
                    },
                    onUploadProgress: (progressEvent) => {
                      onprogress(progressEvent, signedUrl);
                    },
                  },
                };
              }
              return null;
            })
            .filter(Boolean)[0]
      );
      uploads.map(({ signedUrl, file, options }) =>
        uploadaxiosinstance
          .put(signedUrl, file, options)
          .then(() => {
            onUploadFinish(signedUrl);
            toastr.success('One file uploaded successfully');
          })
          .catch((error) => {
            onUploadError(signedUrl);
            toastr.error(
              `${
                error.response
                  ? error.response.data
                  : 'File upload failed, try again later'
              }`
            );
          })
      );
    }
  };

  const onUploadError = (url) => {
    setfileList((files) => {
      if (files.length > 0) {
        const progressArray = files
          .map((obj) => {
            if (obj.signedUrl === url) {
              toastr.error(
                `File ${
                  obj.filename || obj.name
                } upload failed. please try again later`
              );
              return null;
            }
            return obj;
          })
          .filter(Boolean);

        return progressArray;
      }
      return files;
    });
  };

  const onDelete = (fd) => {
    setdeleting(fd);
  };

  const getSignedUrl = async (files) => {
    const urls = await signaxiosinstance()
      .post(signurl, {
        files,
        ACL: ACL || 'public-read',
        dirname: dirname || 'files/',
      })
      .then(({ data }) => {
        const signedUrls = data.signedUrls.map((obj) => ({
          ...obj,
          progress: 0,
        }));
        setfileList((files) => [...files, ...signedUrls]);
        return signedUrls;
      })
      .catch(() => {
        toastr.error(
          'There was an error uploading file. Please try again later'
        );
      });
    return urls;
  };
  return (
    <Block paper padding={20}>
      <input
        type="file"
        id={`fileElem${elemId}`}
        multiple={limit && limit > 1}
        accept={accept}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(1px, 1px, 1px, 1px)',
        }}
        onChange={handleFiles}
      />
      <label htmlFor={`fileElem${elemId}`} style={{ cursor: 'pointer' }}>
        <Block middle center>
          <AttachFile />
          <Text caption>upload</Text>
        </Block>
      </label>
      <List>
        {fileList.map(({ uid, fd, filename, progress, status }) => (
          <ListItem key={uid} dense divider>
            <ListItemIcon>
              <Attachment edge="start" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Text subHeader underline>
                  {filename}
                </Text>
              }
            />
            <ListItemSecondaryAction>
              {progress < 100 && (
                <Text small edge="end">
                  ...uploading <Text subHeader>{`${progress}%`}</Text>
                </Text>
              )}
              {status === 'done' && (
                <IconButton edge="end" onClick={() => onDelete(fd)}>
                  <Close />
                </IconButton>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Dialog
        maxWidth="sm"
        open={deleting !== null}
        onClose={() => setdeleting(null)}
        onConfirm={() => setconfirmdelete(true)}
        minHeight={200}
      >
        <DialogHeader onClose={() => setdeleting(null)} />
        <DialogContent>
          <Text>Sure you want to remove video?</Text>
        </DialogContent>
        <DialogActions>
          <Button
            contained
            color={colors.error}
            onClick={() => {
              setdeleting(null);
            }}
          >
            Cancel
          </Button>
          <Button
            contained
            color={colors.success}
            onClick={() => {
              setconfirmdelete(true);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Block>
  );
};

S3Uploader.defaultProps = {
  onChange: () => {},
};
export default S3Uploader;
