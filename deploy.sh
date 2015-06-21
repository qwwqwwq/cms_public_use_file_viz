#!/bin/bash
aws s3 rm --recursive s3://mmleads-puf-visualization/
aws s3 cp --recursive app s3://mmleads-puf-visualization/app
aws s3 cp index.html s3://mmleads-puf-visualization/index.html
