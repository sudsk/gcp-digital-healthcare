# GCP reference architecture for a Digital Healthcare company

## Table of contents
- Overview
- High Level Design		
- Data Ingestion Pipeline			
  - Overview
  - Dataflow Pipeline
  - BigQuery schemas
- Schema Changes
- Reconciliation		
- Error scenarios	

## Overview 
Digital healthcare raises hundreds of types of events from microservice based architecture. In order to support real time operations as well as requirements for business intelligence, these events must support multiple use cases, but also be able to evolve over time as the microservices themselves to.

The task here is to allow for the ingestion of these events and produce data that is query-able for a number of different views of this data:
- The raw events must be stored in a query-able format
- A view of the current state of an appointment must be shown (Is it currently booked / cancelled or completed) 
- Average duration of appointments should easily be calculable (also by discipline if the information is available).

The solution should be able to:
- Adapt to changes in schema
- Support verification that the end result is correct
- Handle broken events

## High Level Design
[HLD](images/digitalhealth.png)
