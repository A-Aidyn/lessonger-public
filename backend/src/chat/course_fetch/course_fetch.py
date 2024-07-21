import requests
from bs4 import BeautifulSoup
import json

values = {'login_page': 'L_P_COMMON'}

needed_cookies = {}


def getParams(url):
    params = url.split("?")[1]
    params = params.split('&')
    answer = {}
    for param in params:
        k, v = param.split('=')[0], param.split('=')[1]
        answer[k] = v
    return answer


def login(s, username, password):
    url = 'http://klms.kaist.ac.kr'
    r = s.get(url, allow_redirects=False)
    needed_cookies.update(r.cookies)

    url = 'http://klms.kaist.ac.kr/sso2/login.php'
    r = s.get(url, cookies=needed_cookies)
    params = getParams(r.url)
    values['user_id'] = username
    values['pw'] = password
    values['param_id'] = params.get('param_id', '')

    url = 'https://iam2.kaist.ac.kr/api/sso/login'
    r = s.post(url, params=values, cookies=needed_cookies)
    needed_cookies.update(r.cookies)
    data = json.loads(r.content)
    print ('DATA IS -----')
    print (data)
    print('----- cookies -----')
    print(needed_cookies)

    url = 'http://klms.kaist.ac.kr/sso2/ssoreturn.php'

    if data.get("error", {}) == True:
        print (data.get("errorCode", {}))

        return data.get("errorCode", {})

    data = {
        'result': r.content,
        'success': "true",
        'user_id': data.get("dataMap", {}).get("USER_INFO", {}).get("uid", ""),
        'k_uid': data.get("dataMap", {}).get("USER_INFO", {}).get("kaist_uid", ""),
        'state': data.get("dataMap", {}).get("state", "")
    }
    r = requests.post(url, data=data, cookies=needed_cookies, allow_redirects=False)

    needed_cookies['MoodleSession'] = r.cookies.get('MoodleSession', '')
    print("Moodle Session: {}".format(needed_cookies['MoodleSession']))
    soup = BeautifulSoup(r.text, 'html.parser')
    ssid_params = {}
    try:
        ssid_params['ssid'] = soup.find("input", {'name': 'ssid'}).get('value')
        ssid_params['zxcv'] = soup.find("input", {'name': 'zxcv'}).get('value')
        ssid_params['url'] = soup.find("input", {'name': 'url'}).get('value')
    except:
        pass

    url = 'http://klms.kaist.ac.kr/local/ubion/sso/sso_login.php'
    r = s.post(url, data=ssid_params, cookies=needed_cookies, allow_redirects=False)
    needed_cookies['MoodleSession'] = r.cookies.get('MoodleSession', '')

    return True


def get_id(semester):
    if semester == 'Spring':
        return 10
    elif semester == 'Summer':
        return 11
    return 20


def get_info(course):
    if len(course) == 0:
        return (-1, -1)

    i = course.find('(')
    if i == -1:
        return (-1, -1)

    name = course[:i - 1]
    code = course[i + 1: -1]
    return (name, code)


def get_courses(kusername, kpassword, year=20, semester='Spring'):
    global needed_cookies
    needed_cookies = {}
    global values
    values = {'login_page': 'L_P_COMMON'}

    print('Year = ', year, ' Semester = ', semester)

    with requests.Session() as s:
        print(f"Logging into klms as {kusername}")
        login_info = login(s, kusername, kpassword)
        courses = {}
        if login_info!=True:
            courses['error'] = login_info
            courses['courses'] = []
            return courses

        print("Success!")

        url = 'http://klms.kaist.ac.kr/blocks/ubion_shortcut/past.php?y={}&s={}'.format(year, get_id(semester))
        print("Fetching courses...")
        r = s.get(url, cookies=needed_cookies)

        soup = BeautifulSoup(r.content, 'html.parser')

        mydivs = soup.findAll("div", {"class": "regular_course"})
        courses['courses'] = []
        for div in mydivs:
            for course in div.findAll('a'):
                name, code = get_info(course.text)
                courses['courses'].append({'name': name, 'code': code})
        json_data = json.dumps(courses)

    return courses

    print("DONE!!!")


if __name__ == '__main__':
    kusername = input("Please enter your kaist username: ")
    kpassword = input("Please enter your password: ")
    print (get_courses(kusername, kpassword))
