from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import datetime
import pickle
import os.path
scope = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar']

def get_service():
    creds = None
   
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'client_secret.json', scope)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build('calendar', 'v3', credentials=creds)

    return service
    
def main():
    service = get_service()
    event = {
        'summary': 'Test Event',
        'start': {
            'dateTime': '2015-02-28T09:00:00-07:00',
            'timeZone': 'America/Los_Angeles',
        },
        'end': {
            'dateTime': '2020-02-28T17:00:00-07:00',
            'timeZone': 'America/Los_Angeles',
        }
    }
    event = service.events().insert(calendarId='primary', body=event).execute()
    print('Event created: %s' % (event.get('htmlLink')))

if __name__ == "__main__":
    main()