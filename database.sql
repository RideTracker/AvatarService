CREATE TABLE IF NOT EXISTS "avatars" (
	"id"	varchar(255) NOT NULL,
	"name"	varchar(255) NOT NULL,
	"type"	varchar(255) NOT NULL,
	"image"	varchar(255) NOT NULL,
	"timestamp"	bigint NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "avatar_images" (
	"id"	varchar(255) NOT NULL,
	"avatar"	varchar(255) NOT NULL,
	"image"	varchar(255) NOT NULL,
	"index"	int NOT NULL,
	"color_type"	varchar(255) DEFAULT NULL,
	"timestamp"	bigint NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "avatar_colors" (
	"id"	varchar(255) NOT NULL,
	"avatar"	varchar(255) NOT NULL,
	"type"	varchar(255) NOT NULL,
	"index"	int NOT NULL,
	"default_color"	varchar(16) DEFAULT NULL,
	"timestamp"	bigint NOT NULL,
	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "user_avatars" (
    "id" varchar(255) NOT NULL,
    "user" varchar(255) NOT NULL,
    "combination" text NOT NULL,
	"timestamp"	bigint NOT NULL,
    PRIMARY KEY("id")
);
