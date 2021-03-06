const database = require('./database')


async function getAnimeByID(anime_id) {
    let sql = `
        SELECT 
            ANIME_ID, 
            ANIME_TITLE, 
            SYNOPSIS, 
            PICTURE_ID, 
            TO_CHAR(RELEASE_DATE,'YYYY') AS YEAR, 
            RELEASE_SEASON, 
            STUDIO_NAME,
            WRITER, 
            AVG_RATING,
            RANK
        FROM ANIME 
        WHERE ANIME_ID = :ANIME_ID
    `
    return (await database.execute(sql, [anime_id], database.options)).rows[0]
}

async function getAnimeByTitle(title) {
    let sql = `
        SELECT ANIME_ID, ANIME_TITLE, PICTURE_ID FROM ANIME
        WHERE LOWER(ANIME_TITLE) = :TITLE
    `
    return (await database.execute(sql, [title], database.options)).rows
}

async function getAnimesByREGEX(string) {
    let sql = `
    SELECT ANIME_ID, ANIME_TITLE, PICTURE_ID FROM ANIME WHERE LOWER(ANIME_TITLE) LIKE '${string[0]}'`
    for (let i = 1; i < string.length; i++) {
        sql += ` AND LOWER(ANIME_TITLE) LIKE '${string[i]}'`;
    }
    return (await database.execute(sql, [], database.options)).rows
}


async function getGenresByID(anime_id) {
    let sql = `
        SELECT GENRE_NAME FROM ANIME_GENRE WHERE ANIME_ID = :ANIME_ID
    `
    return (await database.execute(sql, [anime_id], database.options)).rows
}


async function getWriterByID(PERSONNEL_ID) {
    let sql = `
        SELECT * FROM WRITER WHERE PERSONNEL_ID = :ID
    `
    return (await database.execute(sql, [PERSONNEL_ID], database.options)).rows[0]
}

async function getAllAnimeTitleAndID() {
    let sql = `
        SELECT ANIME_TITLE, ANIME_ID, PICTURE_ID
        FROM ANIME
    `
    return (await database.execute(sql, [], database.options)).rows
}



async function getAnimesByGenreAndOrYear(genres, years) {
    let sqlgenre = `
        SELECT ANIME_ID FROM ANIME_GENRE WHERE GENRE_NAME = '${genres[0]}'`;
    for (let i = 1; i < genres.length; i++) {
        sqlgenre += `
        INTERSECT 
        (SELECT ANIME_ID FROM ANIME_GENRE WHERE GENRE_NAME = '${genres[i]}')`;
    }
    let sql = `
        SELECT * FROM ANIME 
        WHERE ANIME_ID = ANY(${sqlgenre})
    `

    if (years && years.length > 0) {
        sql += `and (TO_CHAR(RELEASE_DATE, 'YYYY') = ${years[0]}`
        for (let i = 1; i < years.length; i++) {
            sql += ` or TO_CHAR(RELEASE_DATE, 'YYYY') = ${years[i]}`
        }
        sql += `)`
    }
    return (await database.execute(sql, [], database.options)).rows;
}


async function getAnimesByYear(years) {
    if (years.length == 0) return console.log("no years found")

    let sql = `
        SELECT * FROM ANIME WHERE TO_CHAR(RELEASE_DATE, 'YYYY') = ${years[0]}`
    for (let i = 1; i < years.length; i++) {
        sql += ` OR TO_CHAR(RELEASE_DATE, 'YYYY') = ${years[i]}`
    }
    return (await database.execute(sql, [], database.options)).rows
}

async function getAllGenres() {
    let sql = `
        SELECT GENRE_NAME
        FROM GENRE
    `
    return (await database.execute(sql, [], database.options)).rows
}

async function getAnimesTitleandIDByOneGenre(genre) {
    let sql = `
        SELECT *
        FROM ANIME JOIN ANIME_GENRE
        USING (ANIME_ID)
        WHERE GENRE_NAME = '${genre}'
    `
    return (await database.execute(sql, [], database.options)).rows
}











async function updateAnimeRating(anime_id) {
    let sql = `
    BEGIN
	    UPDATE_ANIME_RATING(:ANIME_ID);
    END;
    `
    return (await database.execute(sql, [anime_id], database.options)).rows
}



async function getCharactersOfAnime(anime_id) {
    let sql = `
        SELECT FIRST_NAME, LAST_NAME, PICTURE_ID, VOICE_ACTOR_ID, 
        (SELECT V.FIRST_NAME||' '||V.LAST_NAME FROM VOICE_ACTOR V WHERE V.PERSONNEL_ID = C.VOICE_ACTOR_ID) AS VA_NAME
        FROM CHARACTER C
        WHERE ANIME_ID = :ANIME_ID
    `
    return (await database.execute(sql, [anime_id], database.options)).rows
}

async function getCharacterByName(anime_id, first_name, last_name) {
    let sql = `
        SELECT ANIME_ID, FIRST_NAME, LAST_NAME, ROLE, DESCRIPTION, PICTURE_ID, VOICE_ACTOR_ID, 
        (SELECT V.FIRST_NAME||' '||V.LAST_NAME FROM VOICE_ACTOR V WHERE V.PERSONNEL_ID = C.VOICE_ACTOR_ID) AS VA_NAME
        FROM CHARACTER C
        WHERE ANIME_ID = :ANIME_ID AND FIRST_NAME = :FIRST AND LAST_NAME = :LAST
    `
    return (await database.execute(sql, [anime_id, first_name, last_name], database.options)).rows[0]
}


async function getNumberOfSeasons(anime_id) {
    let sql = `
        SELECT COUNT(DISTINCT SEASON) AS CNT
        FROM EPISODE
        WHERE ANIME_ID = :ID
    `
    return (await database.execute(sql, [anime_id], database.options)).rows[0].CNT
}

async function getEpisodesOfAnime(anime_id) {
    let sql = `
        SELECT *
        FROM EPISODE 
        WHERE ANIME_ID  = :ID
        ORDER BY SEASON, EPISODE_NUMBER
    `
    return (await database.execute(sql, [anime_id], database.options)).rows
}

module.exports = {
    getAnimeByID,
    getAnimeByTitle,
    getAnimesByREGEX,
    getGenresByID,
    getWriterByID,
    getAllAnimeTitleAndID,
    getAllGenres,
    getAnimesByGenreAndOrYear,
    getAnimesByYear,
    getAnimesTitleandIDByOneGenre,

    getCharactersOfAnime,
    getCharacterByName,
    getNumberOfSeasons,
    getEpisodesOfAnime,

    updateAnimeRating
}