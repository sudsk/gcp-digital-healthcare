# GCP data ingestion architecture for a Digital Healthcare company

## Table of contents
- [Introduction](#introduction)
- [High Level Design](#high-level-design)
- [Data Ingestion Pipeline](#data-ingestion-pipeline)			
  - [Overview](#overview)
  - [Setup](#setup)
  - [Dataflow Pipeline](#dataflow-pipeline)
- [Analytics](#analytics)
- [Schema Changes](#schema-changes)
- [Reconciliation](#reconciliation)		
- [Error scenarios](#error-scenarios)	

## Introduction
Digital healthcare raises hundreds of types of events from microservice based architecture such as from their Mobile Apps. In order to support real time operations as well as requirements for business intelligence, these events must support multiple use cases, but also be able to evolve over time as the microservices themselves to.

The task here is to allow for the ingestion of these events and produce data that is query-able for a number of different views of this data:
- The raw events must be stored in a query-able format
- A view of the current state of an appointment must be shown (Is it currently booked / cancelled or completed) 
- Average duration of appointments should easily be calculable (also by discipline if the information is available).

The solution should be able to:
- Adapt to changes in schema
- Support verification that the end result is correct
- Handle broken events

## High Level Design
![HLD](images/digitalhealth.png)

## Data Ingestion Pipeline		
  
### Overview
A usual pattern for storage is to store events on BigTable for low latency access and on BigQuery for analytics requirement. 

The second requirement for view is - A view of the current state of an appointment must be shown (Is it currently booked / cancelled or completed).
Assuming the view is not for querying state of a specific appointment, in which case BigTable is more suitable for low latency access, but to present a current state view for all appointments, in which case we will exclude populating Bigtable from this exercise scope, as all three views requirement can be met by BigQuery. 

Dataflow is obvious choice here for ingestion and recommended by from Google for processing streaming events and storing on BigQuery and/or Bigtable. 

To keep things simple, we will use Dataflow template here. The template can be customised to meet complex scenarios if required. 

### Setup

#### Create PubSub Topic
```
gcloud pubsub topics create digi_appointments_topic --message-storage-policy-allowed-regions=europe-west2
```
#### Create PubSub Subscription
```
gcloud pubsub subscriptions create digi_appointments_bq_sub --topic=digi_appointments_topic --topic-project=digital-health-uk-poc --ack-deadline=10 
```
#### Create BigQuery Schema
- a schema (dataset:digital_health) is created to store the ingested data
```
bq mk --location=europe-west2 digital_health
```
- a table appointment to store the ingested data  

|Field name	|Type	|Mode|
|-----------|-----|----|
|Type|	STRING|	NULLABLE|	
AppointmentId	|STRING	|NULLABLE|	
|TimestampUtc|	TIMESTAMP|	NULLABLE|	
|Discipline|	STRING|	REPEATED|	

```
bq mk -t digital_health.appointment ./code/digital_health_schema.json
```

- a dead letter table (digital_health.appointment_error_records) for error records is automatically created by Dataflow job 

|Field name	|Type	|Mode|
|-----------|-----|----|
|timestamp	|TIMESTAMP|	REQUIRED	|
|payloadString	|STRING|	REQUIRED	|
|payloadBytes|	BYTES|	REQUIRED	|
|attributes	|RECORD	|REPEATED	|
|attributes. key	|STRING|	NULLABLE	|
|attributes. value	|STRING|	NULLABLE	|
|errorMessage	|STRING	|NULLABLE	|
|stacktrace	|STRING|	NULLABLE	|

#### Create a storage bucket
```
export BUCKET_NAME=digital_health_uk_poc
gsutil mb -c standard -l europe-west2 gs://$BUCKET_NAME/
```

### Dataflow Pipeline
- A streaming pipeline using PubSub_Subscription_to_BigQuery template is created using gcloud CLI. 
- A transform UDF javascript function is used to flatten "Data" object in the json message.
```
gcloud dataflow jobs run digital-appt-job-1 \
--gcs-location gs://dataflow-templates/latest/PubSub_Subscription_to_BigQuery \
--region=europe-west1 \
--staging-location=gs://digital_health_uk_poc/stage \
--parameters inputSubscription=projects/digital-health-uk-poc/subscriptions/digital_subs,outputTableSpec=digital-health-uk-poc:digital.appointment,javascriptTextTransformGcsPath=gs://digital_health_uk_poc/flattenData.js,javascriptTextTransformFunctionName=transform
```
## Analytics
- a schema (dataset:analytics) is created to store the analytics views
```
bq mk --location=europe-west2 analytics
```
- A view of the current state of an appointment must be shown (Is it currently booked / cancelled or completed) 
```
bq mk \
--use_legacy_sql=false \
--view \
'SELECT AppointmentId, Type as CurrentStatus
FROM (
SELECT AppointmentId, Type,
       ROW_NUMBER() OVER (PARTITION BY AppointmentId ORDER BY TimestampUtc DESC) AS rnum
FROM digital-health-uk-poc.digital_health.appointment`)
WHERE rnum = 1' \
analytics.appointments_current_view
```
- Average duration of appointments should easily be calculable (also by discipline if the information is available).
```
```

## Schema Changes

## Reconciliation		

## Error scenarios	
