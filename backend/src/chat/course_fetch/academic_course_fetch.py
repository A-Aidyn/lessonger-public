import logging
import requests
from bs4 import BeautifulSoup
import json

logger = logging.getLogger(__name__)


def show(r):
    logger.debug('status: ', r.status_code)
    logger.debug('headers: ', r.headers)
    # logger.debug('content: ', r.content)
    soup = BeautifulSoup(r.text, 'html.parser')
    logger.debug('text: ')
    logger.debug(soup.prettify())
    # logger.debug('text: ', r.text)
    # logger.debug('json: ', r.json())
    logger.debug('cookies: ', r.cookies)
    logger.debug()


# def academic_system_login(s, username='', password=''):
#     data = {
#         'user_id': username,
#         'pw': password,
#         'login_page': 'L_P_IAMPS'
#     }
#
#     url = 'https://iam2.kaist.ac.kr/api/sso/login'
#     r = s.post(url, data=data)
#     # show(r)
#     data = r.json()
#     if data.get('error', False):
#         return data.get('errorCode', 'SSO_LOGIN_FAIL')
#
#     r = s.get('https://cais.kaist.ac.kr/appliedCourses')
#     # show(r)
#     soup = BeautifulSoup(r.text, 'html.parser')
#     data = {
#         'success': soup.find('input', {'name': 'success'}).get('value'),
#         'k_uid': soup.find('input', {'name': 'k_uid'}).get('value'),
#         'user_id': soup.find('input', {'name': 'user_id'}).get('value'),
#         'state': soup.find('input', {'name': 'state'}).get('value'),
#         'result': soup.find('input', {'name': 'result'}).get('value')
#     }
#     r = s.post('https://cais.kaist.ac.kr/ssoNewLogin', data=data)
#     # show(r)
#
#     r = s.get('https://cais.kaist.ac.kr/ssoLogin', params={'lang': 'ENG'})
#     # show(r)
#
#     return True

def academic_system_login(s, request):
    success = request.data.get('success', 'false')
    if success != 'true':
        return 'Log in error!'
    data = {
        'success': request.data.get('success', ''),
        'k_uid': request.data.get('k_uid', ''),
        'user_id': request.data.get('user_id', ''),
        'state': request.data.get('state', ''),
        'result': request.data.get('result', '')
    }
    r = s.post('https://cais.kaist.ac.kr/ssoNewLogin', data=data)
    # show(r)
    if "System error" in r.text:
        return 'Log in error!'

    r = s.get('https://cais.kaist.ac.kr/ssoLogin', params={'lang': 'ENG'})
    # show(r)

    return True


def get_profile_n_courses(request):

    with requests.Session() as s:
        # logger.debug(f"Logging into portal as {kusername}")
        login_info = academic_system_login(s, request)

        data = {}
        if login_info != True:
            data['error'] = login_info
            return data

        r = s.get('https://cais.kaist.ac.kr/appliedCourses')
        soup = BeautifulSoup(r.text, 'html.parser')

        tmp = soup.find(id='userinfo').b.get_text().split(',')
        surname = tmp[0]
        name = ''
        if len(tmp) > 1:
            name = tmp[1]

        data['profile'] = {
            'name': name,
            'surname': surname,
            'position': soup.find(id='sel_gubun').option.get_text().strip().lower(),
        }
        data['courses'] = []
        table = soup.find(id='contentTable').find('tbody').find_all('tr')
        logger.debug(f"table: {table}")
        for table_entry in table:
            tmp = table_entry.find_all('td')
            logger.debug(f"tds: {tmp}")
            name = tmp[7].a
            if name is None:
                name = tmp[7]
            data['courses'].append({
                'code': tmp[5].get_text().strip(),
                'section': tmp[4].get_text().strip(),
                'name': name.get_text(),
                'instructor': tmp[11].get_text(),
            })

    return data


# if __name__ == '__main__':
#     kusername = input("Please enter your kaist username: ")
#     kpassword = input("Please enter your password: ")
#     logger.debug (get_profile_n_courses(kusername, kpassword))