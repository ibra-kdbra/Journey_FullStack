# Car Registration

**Functional Requirements (RF)**
It should be possible to register a new car.

**Business Rules (RN)**
Only administrators can register cars.
It should not be possible to register a car with an already existing license plate.

* The car should be registered as available by default.

## Car Listing

**Functional Requirements (RF)**
It should be possible to list the available cars.
It should be possible to list the car by the name of the category.
It should be possible to list the car by the name of the brand.
It should be possible to list the car by the name of the car.

**Business Rules (RN)**
The user does not need to be logged into the system.

## Car Specification Registration

**Functional Requirements (RF)**
It should be possible to register a specification for a car.

**Business Rules (RN)**
It should not be possible to register a specification for a car not registered.
It should not be possible to register an existing specification for the same car.

## Car Image Registration

**Functional Requirements (RF)**
It should be possible to register the car's image.
It should be possible to list all cars.

**Non-Functional Requirements (RNF)**
Use multer for file uploads.

**Business Rules (RN)**
Only administrators can register images.
The user should be able to register more than one image for the same car.

## Car Rental

**Functional Requirements (RF)**
It should be possible to register a rental.

**Business Rules (RN)**
The rental must have a minimum duration of 24 hours.
It should not be possible to register a new rental if there is already one open for the same user.
It should not be possible to register a new rental if there is already one open for the same car.
