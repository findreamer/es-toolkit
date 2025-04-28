export enum DesensitizeType {
  /** 用户名 */
  NAME = 'name',
  /** 手机号 */
  PHONE_NO = 'phone_no',
  /** 身份证号 */
  ID = 'id_card',
  /** 银行卡号 */
  BANK_NO = 'bank_no',
  /** 地址 */
  ADDRESS = 'address',
  /** 电子邮箱 */
  EMAIL = 'email',
}

function desensitizeUtil(data: string, start: number, end: number, maxLen = Number.MAX_VALUE): string {
  const dataLen = data.length;
  const firstChars = data.substring(0, start);
  const lastChars = end ? data.slice(-end) : '';
  const repeatLen = dataLen - start - end;

  return `${firstChars}${'*'.repeat(repeatLen > 0 ? repeatLen : 0)}${lastChars}`.substr(0, maxLen);
}

function desensitize(data: string, type: `${DesensitizeType}`): string;
function desensitize(data: string, start: number, end: number): string;
function desensitize(data: string, param2: `${DesensitizeType}` | number, param3?: number): string {
  if (!data) {
    return data;
  }

  if (typeof param2 === 'string') {
    const type = param2;
    let firstLen = 0,
      lastLen = 0,
      maxLen = Number.MAX_VALUE,
      dataLen = data.length;

    switch (type) {
      case DesensitizeType.NAME: {
        // 统一脱敏规则，与安全部保持一致，仅显示姓氏，如李**；3字以内保留第一个字，4字及以上保留前两个字
        // 李** / 欧阳**
        firstLen = dataLen > 3 ? 2 : 1;
        break;
      }
      case DesensitizeType.PHONE_NO: {
        // 两种 1)业务方走安全申请的脱敏规则  2)否则统一显示后3位
        // *********561
        lastLen = 3;
        break;
      }
      case DesensitizeType.BANK_NO:
      // 两种 1)业务方走安全申请的脱敏规则 2)否则统一显示前1后1
      case DesensitizeType.ID: {
        // 两种 1)业务方走安全申请的脱敏规则 2)否则统一显示前1后1
        // 3************3
        firstLen = lastLen = 1;
        break;
      }
      case DesensitizeType.ADDRESS: {
        // 3位以下不脱敏；3-6位：前1后1；6位：前2后2；6位以上：前6，后面四颗星****
        // 山*省 / 山东**沂市 / 山东省临沂市****
        if (dataLen > 6) {
          firstLen = 6;
        } else if (dataLen === 6) {
          firstLen = lastLen = 2;
        } else {
          firstLen = lastLen = 1;
        }
        maxLen = 10;
        break;
      }
      case DesensitizeType.EMAIL: {
        // 3位以下不脱敏；3-5位以下：保留前两位；5位以上：保留前3位
        // xi** 或 xia***********
        firstLen = dataLen > 5 ? 3 : 2;
        break;
      }
    }

    return desensitizeUtil(data, firstLen, lastLen, maxLen);
  }

  return desensitizeUtil(data, param2, param3);
}

export default desensitize;
