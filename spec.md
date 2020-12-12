# Collaborative clock and transport proof-of-concept

This document lays out requirements for a proof-of-concept clock and transport for web audio applications.

## Goals

The goal is to create a simple application where two users collaborate on a shared data structure that syncs over a time-based loop. 

## Definitions

- Server - a backend application that stores and syncs the data structure
- Client - a frontend application that plays and updates its part of the data structure
- Server Data - the server version of the data structure
- Local Data - the local version of the data structure. Each client has their own version of Local Data.
- Clock - a thing that keeps time. Each client uses one to play over the data structure.
- Loop Start - the time when the loop is started or restarted after loop end
- Transport - a set of controls that a user interacts with to start or stop the Clock

## Constraints

- Local Data and Server Data use the same schema
- Clients own a section of the schema. A Client may only modify data that corresponds to a section they own. The goal is to simplify synchronization and prevent data tug-of-wars.
- Each Client can only modify their Local Data. They send their Local Data to the Server, and the Server updates Server Data 
- Each Client has their own Clock. Clocks do not need to stay in sync with each other.

## Clock

Each Client has a Clock that is used to track time across the loop and determine when to restart the loop. A stable clock implementation is outlined in https://blog.paul.cx/post/metronome/.

## Synchronization

Synchronization occurs on the Server and on the Client.

On the Server:

- The Server may receive Local Data from a Client at any time
- The Server updates Server Data with any changes in Local Data
- The Server sends the updated Server Data to each Client immediately after the update (should the Server send updates to the Client that requested the update?)

On the Client:

- The Client may receive Server Data from the Server at any time
- The Client caches Server Data until moments before Loop Start, at which point:
  1. The Client updates their Local Data with the changes in Server Data
  2. The Client sends the updated version of Local Data to the Server 

## Transport

Each Client has a play and a pause button. When a client clicks the play button, they enter a playing state. When a client presses the pause button, they enter a stopped state. 

The transport controls determine local activity, but should not interrupt synchronization with Server Data.

When a Client is in a playing state:

- Their Clock is running
- The Client refers to Local Data to play notes or show visual feedback
- The Client sends updates to the Server 
- The Server sends updates to the Client and the Client updates Local Data

When a Client is in a stopped state:

- Their Clock is stopped
- The Client does not play notes or show visual feedback
- The Client does not send updates to the Server
- The Server sends updates to the Client and the Client updates Local Data

## Persistence

Persistence in memory on both the Client and Server might be enough for the proof-of-concept.

## Non-goals

We are only proving clocks, synchronization, and transport within the Constraints. Clients do not need to have synchronized clocks. This means playing in the same physical location may be out of sync.

We do not need a fancy web audio app. The simplest UI and audio possible will suffice.

We do not need authentication, accounts or any other pieces of a larger application. Client an pull their identity from an environment variable or from `localstorage`.
