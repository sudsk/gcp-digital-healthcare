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
#### Create PubSub Subscription
#### Create BigQuery Schema
```
```

### Dataflow Pipeline

## Analytics

## Schema Changes

## Reconciliation		

## Error scenarios	
