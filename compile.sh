#!/bin/bash

gulp clean;
gulp copy;
gulp bundle-app;
gulp bundle-admin;
gulp rename-app; 
gulp rename-admin; 
gulp replace-app;
gulp replace-admin;
#firebase deploy;
