const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');

const PORT = 9998;

// Valid application definition.
const validApplication = {
    name: 'valid-application',
    details: {
        url: 'https://glue42.com/'
    }
};

/**
 * Invalid application definition, because it doesn't have a details.url property.
 * @glue42/web's AppManager API should ignore the application definition and should display a warning inside the console.
 */
const invalidApplication = {
    name: 'invalid-application'
};

const detailsRemoteApplication = {
    name: "AppWithDetails-remote",
    title: "AppWithDetails-title",
    version: "AppWithDetails-version",
    icon: "AppWithDetails-icon",
    caption: "AppWithDetails-caption",
    details: {
        url: "https://glue42.com/",
        context: {
            b: 98
        },
        width: 400,
        height: 400,
        top: 100,
        left: 100
    },
    customProperties: {
        a: 97
    },
    intents: [
        {
            name: "AppWithDetails-remote-intent",
            displayName: "AppWithDetails-remote-intent-displayName",
            contexts: [
                "test-context"
            ]
        }
    ]
};

// The application is already part of the local application definitions.
const duplicateApplication = {
    name: "Test",
    details: {
        url: "http://localhost:9999"
    }
};

let applications = [
    validApplication,
    invalidApplication,
    detailsRemoteApplication,
    duplicateApplication
];

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.listen(PORT, () => console.log(`The remote source application (application definitions provider) is running on port ${PORT}.`));

app.get("/v1/apps/search", (_, res) => {
    res.json({
        applications,
        message: 'OK'
    });
});

app.get('/v1/apps/reset', (_, res) => {
    applications = [
        validApplication,
        invalidApplication,
        detailsRemoteApplication,
        duplicateApplication
    ];

    res.json({
        applications,
        message: 'OK'
    });
});

app.post('/v1/apps/add', (req, res) => {
    const newApplication = req.body;

    applications = [
        ...applications,
        newApplication
    ];

    res.json({
        applications,
        message: 'OK'
    });
});


app.post('/v1/apps/set', (req, res) => {
    const newApplications = req.body;

    applications = newApplications;

    res.json({
        applications,
        message: 'OK'
    });
});
